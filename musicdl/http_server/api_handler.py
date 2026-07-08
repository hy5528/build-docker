'''
公共 API 处理模块
将所有业务逻辑从 Flask 路由中抽离出来，保持路由层与业务逻辑解耦。
每个 handle_* 函数接收解析好的参数，返回 (status_code, response_dict)。
'''
import os
import sys
import copy
import json
import time
import threading
from pathlib import Path

# 将 musicdl 项目根目录加入 sys.path
MUSICDL_ROOT = Path(__file__).resolve().parent.parent / 'musicdl'
if str(MUSICDL_ROOT) not in sys.path:
    sys.path.insert(0, str(MUSICDL_ROOT))

from musicdl.musicdl import MusicClient, DEFAULT_MUSIC_SOURCES
from musicdl.modules import MusicClientBuilder, SongInfo, LyricSearchClient

# ======================== 文件持久化任务存储 ========================

import uuid

# 内存缓存：{task_id: task_dict}，与磁盘文件保持同步
_tasks = {}
_tasks_lock = threading.Lock()
# 任务存储目录（在 set_work_dir 中初始化）
_tasks_dir = None


def _get_tasks_dir():
    """获取任务存储目录路径，若不存在则自动创建"""
    global _tasks_dir
    if _tasks_dir is None:
        _tasks_dir = os.path.join(DEFAULT_WORK_DIR, 'tasks')
    os.makedirs(_tasks_dir, exist_ok=True)
    return _tasks_dir


def _task_file_path(task_id):
    """获取任务对应的 JSON 文件路径"""
    return os.path.join(_get_tasks_dir(), f'{task_id}.json')


def _save_task_to_file(task):
    """将任务持久化写入 JSON 文件"""
    try:
        fp = _task_file_path(task['task_id'])
        # 写入临时文件再重命名，保证原子性
        tmp_fp = fp + '.tmp'
        with open(tmp_fp, 'w', encoding='utf-8') as f:
            json.dump(task, f, ensure_ascii=False, indent=2, default=str)
        os.replace(tmp_fp, fp)
    except Exception as e:
        print(f'[task_store] 保存任务文件失败: {task.get("task_id")}, {e}')


def _delete_task_file(task_id):
    """删除任务对应的 JSON 文件"""
    try:
        fp = _task_file_path(task_id)
        if os.path.exists(fp):
            os.remove(fp)
    except Exception as e:
        print(f'[task_store] 删除任务文件失败: {task_id}, {e}')


def _load_tasks_from_disk():
    """从磁盘加载所有历史任务到内存缓存"""
    global _tasks
    tasks_dir = _get_tasks_dir()
    loaded = {}
    if not os.path.isdir(tasks_dir):
        return
    for fn in os.listdir(tasks_dir):
        if not fn.endswith('.json'):
            continue
        fp = os.path.join(tasks_dir, fn)
        try:
            with open(fp, 'r', encoding='utf-8') as f:
                task = json.load(f)
            task_id = task.get('task_id')
            if task_id:
                # 将重启前仍为 running/pending 的任务标记为中断
                if task.get('status') in ('running', 'pending'):
                    task['status'] = 'interrupted'
                    task['message'] = '服务重启，任务中断'
                    task['updated_at'] = time.time()
                    # 回写修正后的状态
                    _save_task_to_file_raw(fp, task)
                loaded[task_id] = task
        except Exception as e:
            print(f'[task_store] 加载任务文件失败: {fp}, {e}')
    with _tasks_lock:
        _tasks = loaded
    print(f'[task_store] 从磁盘加载了 {len(loaded)} 个历史任务')


def _save_task_to_file_raw(fp, task):
    """直接写入指定路径（内部辅助，不依赖 _task_file_path）"""
    try:
        tmp_fp = fp + '.tmp'
        with open(tmp_fp, 'w', encoding='utf-8') as f:
            json.dump(task, f, ensure_ascii=False, indent=2, default=str)
        os.replace(tmp_fp, fp)
    except Exception as e:
        print(f'[task_store] 写入任务文件失败: {fp}, {e}')


def _task_store_create(task_type, params):
    """创建异步任务，返回 task_id"""
    task_id = str(uuid.uuid4())
    task = {
        'task_id': task_id,
        'type': task_type,
        'status': 'pending',
        'progress': 0,
        'message': '',
        'result': None,
        'created_at': time.time(),
        'updated_at': time.time(),
        'params': params,
    }
    with _tasks_lock:
        _tasks[task_id] = task
    _save_task_to_file(task)
    return task_id


def _task_store_update(task_id, **kwargs):
    """更新任务状态"""
    with _tasks_lock:
        task = _tasks.get(task_id)
        if task is None:
            return
        task.update(kwargs)
        task['updated_at'] = time.time()
        task_copy = copy.deepcopy(task)
    _save_task_to_file(task_copy)


def _task_store_get(task_id):
    """获取任务信息（返回深拷贝）"""
    with _tasks_lock:
        task = _tasks.get(task_id)
        if task is None:
            return None
        return copy.deepcopy(task)


def _task_store_list(status_filter=None, type_filter=None, limit=50):
    """列出所有任务（按创建时间倒序）"""
    with _tasks_lock:
        tasks = []
        for task in _tasks.values():
            if status_filter and task.get('status') != status_filter:
                continue
            if type_filter and task.get('type') != type_filter:
                continue
            tasks.append(copy.deepcopy(task))
    tasks.sort(key=lambda t: t.get('created_at', 0), reverse=True)
    return tasks[:limit]


def _task_store_delete(task_id):
    """删除任务，返回 True/False"""
    with _tasks_lock:
        removed = _tasks.pop(task_id, None) is not None
    if removed:
        _delete_task_file(task_id)
    return removed

# ======================== 全局配置 ========================

# 服务工作目录（所有数据的根目录）
DEFAULT_WORK_DIR = os.environ.get('MUSICDL_WORK_DIR', '.')
# musicdl 音乐下载输出目录（服务工作目录的子目录）
DEFAULT_MUSICDL_OUTPUT_DIR = os.path.join(DEFAULT_WORK_DIR, 'musicdl_outputs')

# ======================== 辅助函数 ========================

def set_work_dir(work_dir):
    """设置服务工作目录，同时更新 musicdl 输出子目录，并从磁盘加载历史任务"""
    global DEFAULT_WORK_DIR, DEFAULT_MUSICDL_OUTPUT_DIR, _tasks_dir
    DEFAULT_WORK_DIR = work_dir
    DEFAULT_MUSICDL_OUTPUT_DIR = os.path.join(work_dir, 'musicdl_outputs')
    _tasks_dir = os.path.join(work_dir, 'tasks')
    # 从磁盘加载历史任务
    _load_tasks_from_disk()


def _build_client(music_sources=None, init_music_clients_cfg=None,
                  clients_threadings=None, requests_overrides=None, search_rules=None):
    """根据请求参数构建 MusicClient 实例"""
    # 将 DEFAULT_WORK_DIR 注入到每个音乐源的配置中（如果调用方未显式指定 work_dir）
    init_music_clients_cfg = init_music_clients_cfg or {}
    all_sources = music_sources or list(MusicClientBuilder.REGISTERED_MODULES.keys())
    for src in all_sources:
        src_cfg = init_music_clients_cfg.setdefault(src, {})
        src_cfg.setdefault('work_dir', DEFAULT_MUSICDL_OUTPUT_DIR)
    return MusicClient(
        music_sources=music_sources or [],
        init_music_clients_cfg=init_music_clients_cfg,
        clients_threadings=clients_threadings or {},
        requests_overrides=requests_overrides or {},
        search_rules=search_rules or {},
    )


def _song_info_to_dict(song_info):
    """将 SongInfo 对象转换为可序列化的字典"""
    if isinstance(song_info, SongInfo):
        d = song_info.todict()
    elif isinstance(song_info, dict):
        d = copy.deepcopy(song_info)
    else:
        return song_info
    d.pop('raw_data', None)
    d.pop('downloaded_contents', None)
    if d.get('episodes') and isinstance(d['episodes'], list):
        d['episodes'] = [_song_info_to_dict(e) for e in d['episodes']]
    return d


def _create_task(task_type, params):
    """创建异步任务"""
    return _task_store_create(task_type, params)


def _update_task(task_id, **kwargs):
    """更新任务状态"""
    _task_store_update(task_id, **kwargs)


def _get_task(task_id):
    """获取任务信息"""
    return _task_store_get(task_id)


def _make_ok(data=None, message='ok'):
    """构造成功响应"""
    resp = {'success': True, 'message': message}
    if data is not None:
        resp['data'] = data
    return 200, resp


def _make_err(message, code=400):
    """构造错误响应"""
    return code, {'success': False, 'error': message}


# ======================== API 处理函数 ========================

def handle_get_sources():
    """获取所有已注册的音乐源列表"""
    all_sources = list(MusicClientBuilder.REGISTERED_MODULES.keys())
    return _make_ok({
        'sources': all_sources,
        'default_sources': list(DEFAULT_MUSIC_SOURCES),
        'total': len(all_sources),
    })


def handle_search(data):
    """搜索音乐（同步）"""
    keyword = (data.get('keyword') or '').strip()
    if not keyword:
        return _make_err('参数 "keyword" 不能为空')
    try:
        client = _build_client(
            music_sources=data.get('music_sources'),
            init_music_clients_cfg=data.get('init_music_clients_cfg'),
            clients_threadings=data.get('clients_threadings'),
            requests_overrides=data.get('requests_overrides'),
            search_rules=data.get('search_rules'),
        )
        raw_results = client.search(keyword=keyword)
        flat_results = []
        for source, items in raw_results.items():
            for idx, item in enumerate(items):
                flat_results.append({
                    'source': source,
                    'index': idx,
                    'song_info': _song_info_to_dict(item),
                })
        return _make_ok({
            'keyword': keyword,
            'total': len(flat_results),
            'results': flat_results,
        })
    except Exception as e:
        return _make_err(f'搜索失败: {str(e)}', 500)


def handle_search_async(data):
    """搜索音乐（异步）"""
    keyword = (data.get('keyword') or '').strip()
    if not keyword:
        return _make_err('参数 "keyword" 不能为空')
    task_id = _create_task('search', {'keyword': keyword})

    def _do_search():
        try:
            _update_task(task_id, status='running', message=f'正在搜索: {keyword}')
            client = _build_client(
                music_sources=data.get('music_sources'),
                init_music_clients_cfg=data.get('init_music_clients_cfg'),
                clients_threadings=data.get('clients_threadings'),
                requests_overrides=data.get('requests_overrides'),
                search_rules=data.get('search_rules'),
            )
            raw_results = client.search(keyword=keyword)
            flat_results = []
            for source, items in raw_results.items():
                for idx, item in enumerate(items):
                    flat_results.append({
                        'source': source,
                        'index': idx,
                        'song_info': _song_info_to_dict(item),
                    })
            _update_task(task_id, status='completed', progress=100, result={
                'keyword': keyword, 'total': len(flat_results), 'results': flat_results,
            })
        except Exception as e:
            _update_task(task_id, status='failed', message=f'搜索失败: {str(e)}')

    threading.Thread(target=_do_search, daemon=True).start()
    return _make_ok({'task_id': task_id}, message='搜索任务已提交')


def handle_download(data):
    """下载音乐（异步）"""
    song_infos_raw = data.get('song_infos', [])
    if not song_infos_raw or not isinstance(song_infos_raw, list):
        return _make_err('参数 "song_infos" 不能为空，需要是 SongInfo 字典列表')
    song_infos = []
    for si in song_infos_raw:
        if isinstance(si, dict):
            song_infos.append(SongInfo.fromdict(si))
        elif isinstance(si, SongInfo):
            song_infos.append(si)
    if not song_infos:
        return _make_err('无有效的 song_info 数据')
    task_id = _create_task('download', {'count': len(song_infos)})

    def _do_download():
        try:
            _update_task(task_id, status='running', message=f'正在下载 {len(song_infos)} 首歌曲')
            needed_sources = list(set(si.source for si in song_infos if si.source))
            client = _build_client(
                music_sources=needed_sources or data.get('music_sources'),
                init_music_clients_cfg=data.get('init_music_clients_cfg'),
                clients_threadings=data.get('clients_threadings'),
                requests_overrides=data.get('requests_overrides'),
            )
            client.download(song_infos=song_infos)
            downloaded_files = []
            for si in song_infos:
                save_path = si.save_path
                if save_path and os.path.exists(save_path):
                    downloaded_files.append({
                        'song_name': si.song_name,
                        'singers': si.singers,
                        'source': si.source,
                        'save_path': save_path,
                        'file_name': os.path.basename(save_path),
                    })
            _update_task(task_id, status='completed', progress=100, result={
                'total': len(song_infos),
                'downloaded': len(downloaded_files),
                'files': downloaded_files,
            })
        except Exception as e:
            _update_task(task_id, status='failed', message=f'下载失败: {str(e)}')

    threading.Thread(target=_do_download, daemon=True).start()
    return _make_ok({'task_id': task_id}, message='下载任务已提交')


def handle_search_and_download(data):
    """搜索并自动下载（异步）"""
    keyword = (data.get('keyword') or '').strip()
    if not keyword:
        return _make_err('参数 "keyword" 不能为空')
    max_download = data.get('max_download', 5)
    task_id = _create_task('search_and_download', {'keyword': keyword, 'max_download': max_download})

    def _do_search_and_download():
        try:
            _update_task(task_id, status='running', message=f'正在搜索: {keyword}')
            client = _build_client(
                music_sources=data.get('music_sources'),
                init_music_clients_cfg=data.get('init_music_clients_cfg'),
                clients_threadings=data.get('clients_threadings'),
                requests_overrides=data.get('requests_overrides'),
                search_rules=data.get('search_rules'),
            )
            raw_results = client.search(keyword=keyword)
            all_song_infos = []
            for source, items in raw_results.items():
                for item in items:
                    if item.with_valid_download_url:
                        all_song_infos.append(item)
            to_download = all_song_infos[:max_download]
            if not to_download:
                _update_task(task_id, status='completed', progress=100, result={
                    'keyword': keyword, 'searched': sum(len(v) for v in raw_results.values()),
                    'downloaded': 0, 'files': [], 'message': '未找到可下载的歌曲',
                })
                return
            _update_task(task_id, status='running', progress=50, message=f'正在下载 {len(to_download)} 首歌曲')
            client.download(song_infos=to_download)
            downloaded_files = []
            for si in to_download:
                save_path = si.save_path
                if save_path and os.path.exists(save_path):
                    downloaded_files.append({
                        'song_name': si.song_name,
                        'singers': si.singers,
                        'source': si.source,
                        'save_path': save_path,
                        'file_name': os.path.basename(save_path),
                    })
            _update_task(task_id, status='completed', progress=100, result={
                'keyword': keyword,
                'searched': sum(len(v) for v in raw_results.values()),
                'downloaded': len(downloaded_files),
                'files': downloaded_files,
            })
        except Exception as e:
            _update_task(task_id, status='failed', message=f'搜索下载失败: {str(e)}')

    threading.Thread(target=_do_search_and_download, daemon=True).start()
    return _make_ok({'task_id': task_id}, message='搜索并下载任务已提交')


def handle_parse_playlist(data):
    """解析歌单（异步任务）"""
    playlist_url = (data.get('playlist_url') or '').strip()
    if not playlist_url:
        return _make_err('参数 "playlist_url" 不能为空')
    task_id = _create_task('playlist_parse', {'playlist_url': playlist_url})

    def _do_parse_playlist():
        try:
            _update_task(task_id, status='running', message=f'正在解析歌单: {playlist_url}')
            client = _build_client(
                music_sources=data.get('music_sources'),
                init_music_clients_cfg=data.get('init_music_clients_cfg'),
            )
            song_infos = client.parseplaylist(playlist_url=playlist_url) or []
            results = [_song_info_to_dict(si) for si in song_infos]
            _update_task(task_id, status='completed', progress=100, result={
                'playlist_url': playlist_url,
                'total': len(results),
                'songs': results,
            })
        except Exception as e:
            _update_task(task_id, status='failed', message=f'歌单解析失败: {str(e)}')

    threading.Thread(target=_do_parse_playlist, daemon=True).start()
    return _make_ok({'task_id': task_id}, message='歌单解析任务已提交')


def handle_download_playlist(data):
    """解析歌单并下载（异步）"""
    playlist_url = (data.get('playlist_url') or '').strip()
    if not playlist_url:
        return _make_err('参数 "playlist_url" 不能为空')
    max_download = data.get('max_download', 0)
    task_id = _create_task('playlist_download', {'playlist_url': playlist_url})

    def _do_playlist_download():
        try:
            _update_task(task_id, status='running', message=f'正在解析歌单: {playlist_url}')
            client = _build_client(
                music_sources=data.get('music_sources'),
                init_music_clients_cfg=data.get('init_music_clients_cfg'),
                clients_threadings=data.get('clients_threadings'),
                requests_overrides=data.get('requests_overrides'),
            )
            song_infos = client.parseplaylist(playlist_url=playlist_url) or []
            if not song_infos:
                _update_task(task_id, status='completed', progress=100, result={
                    'playlist_url': playlist_url, 'parsed': 0, 'downloaded': 0, 'files': [],
                    'message': '歌单为空或解析失败',
                })
                return
            if max_download > 0:
                song_infos = song_infos[:max_download]
            _update_task(task_id, status='running', progress=30, message=f'正在下载 {len(song_infos)} 首歌曲')
            client.download(song_infos=song_infos)
            downloaded_files = []
            for si in song_infos:
                save_path = si.save_path if isinstance(si, SongInfo) else si.get('save_path', '')
                if save_path and os.path.exists(save_path):
                    downloaded_files.append({
                        'song_name': si.song_name if isinstance(si, SongInfo) else si.get('song_name'),
                        'singers': si.singers if isinstance(si, SongInfo) else si.get('singers'),
                        'source': si.source if isinstance(si, SongInfo) else si.get('source'),
                        'save_path': save_path,
                        'file_name': os.path.basename(save_path),
                    })
            _update_task(task_id, status='completed', progress=100, result={
                'playlist_url': playlist_url,
                'parsed': len(song_infos),
                'downloaded': len(downloaded_files),
                'files': downloaded_files,
            })
        except Exception as e:
            _update_task(task_id, status='failed', message=f'歌单下载失败: {str(e)}')

    threading.Thread(target=_do_playlist_download, daemon=True).start()
    return _make_ok({'task_id': task_id}, message='歌单下载任务已提交')


def handle_search_lyrics(data):
    """搜索歌词"""
    track_name = (data.get('track_name') or '').strip()
    artist_name = (data.get('artist_name') or '').strip()
    if not track_name or not artist_name:
        return _make_err('参数 "track_name" 和 "artist_name" 不能为空')
    try:
        allowed_apis = data.get('allowed_lyric_apis') or ('searchbylrclibapig', 'searchbylrclibapis')
        lyric_result, lyric = LyricSearchClient.search(
            track_name=track_name,
            artist_name=artist_name,
            allowed_lyric_apis=tuple(allowed_apis),
        )
        return _make_ok({
            'track_name': track_name,
            'artist_name': artist_name,
            'lyric': lyric,
            'lyric_result': lyric_result if isinstance(lyric_result, (dict, list)) else str(lyric_result),
        })
    except Exception as e:
        return _make_err(f'歌词搜索失败: {str(e)}', 500)


def handle_get_task(task_id):
    """查询任务状态"""
    task = _get_task(task_id)
    if not task:
        return _make_err(f'任务 {task_id} 不存在', 404)
    task.pop('params', None)
    return _make_ok(task)


def handle_list_tasks(status_filter=None, type_filter=None, limit=50):
    """获取所有任务列表"""
    tasks = _task_store_list(
        status_filter=status_filter,
        type_filter=type_filter,
        limit=limit,
    )
    for t in tasks:
        t.pop('params', None)
    return _make_ok({
        'total': len(tasks),
        'tasks': tasks,
    })


def handle_delete_task(task_id):
    """删除任务"""
    if _task_store_delete(task_id):
        return _make_ok(message=f'任务 {task_id} 已删除')
    return _make_err(f'任务 {task_id} 不存在', 404)


def _format_file_size(size_bytes):
    """格式化文件大小，小于 1MB 以 KB 显示，否则以 MB 显示"""
    if size_bytes < 1024 * 1024:
        return f'{size_bytes / 1024:.2f} KB'
    return f'{size_bytes / 1024 / 1024:.2f} MB'


def handle_list_files(work_dir=None, recursive=False):
    """列出工作目录下的文件"""
    work_dir = work_dir or DEFAULT_MUSICDL_OUTPUT_DIR
    # 安全校验：确保路径在 musicdl_outputs 目录范围内，不允许往上级查找
    abs_work_dir = os.path.abspath(work_dir)
    abs_output_root = os.path.abspath(DEFAULT_MUSICDL_OUTPUT_DIR)
    if not abs_work_dir.startswith(abs_output_root):
        return _make_err('不允许访问 musicdl_outputs 目录之外的路径', 403)
    if not os.path.isdir(work_dir):
        return _make_err(f'目录不存在: {work_dir}', 404)
    files = []
    audio_exts = {'.mp3', '.flac', '.wav', '.m4a', '.ogg', '.opus', '.wma', '.aac',
                  '.ape', '.wv', '.tta', '.dsf', '.dff', '.mp4'}
    if recursive:
        for root, dirs, filenames in os.walk(work_dir):
            for fn in filenames:
                fp = os.path.join(root, fn)
                ext = os.path.splitext(fn)[1].lower()
                if ext in audio_exts or ext == '.lrc':
                    stat = os.stat(fp)
                    files.append({
                        'name': fn,
                        'path': fp,
                        'size_bytes': stat.st_size,
                        'size': _format_file_size(stat.st_size),
                        'modified_at': stat.st_mtime,
                        'type': 'lyrics' if ext == '.lrc' else 'audio',
                    })
    else:
        for fn in os.listdir(work_dir):
            fp = os.path.join(work_dir, fn)
            if os.path.isdir(fp):
                files.append({'name': fn, 'path': fp, 'type': 'directory'})
            elif os.path.isfile(fp):
                stat = os.stat(fp)
                files.append({
                    'name': fn,
                    'path': fp,
                    'size_bytes': stat.st_size,
                    'size': _format_file_size(stat.st_size),
                    'modified_at': stat.st_mtime,
                    'type': 'file',
                })
    return _make_ok({
        'work_dir': work_dir,
        'total': len(files),
        'files': files,
    })


def handle_download_file(file_path):
    """
    获取下载文件的信息（不直接发送文件，由调用方处理文件发送）。
    返回 (status_code, response_dict_or_file_info)
    如果成功，返回特殊标记 {'_file_download': True, 'path': ..., 'filename': ...}
    """
    if not file_path:
        return _make_err('参数 "path" 不能为空')
    # 统一转为绝对路径（基于进程 cwd，与 handle_list_files 行为一致）
    file_path = os.path.abspath(file_path)
    # 安全校验：确保路径在允许的 musicdl 输出目录范围内
    abs_work_dir = os.path.abspath(DEFAULT_MUSICDL_OUTPUT_DIR)
    if not file_path.startswith(abs_work_dir):
        return _make_err('不允许访问工作目录之外的文件', 403)
    if not os.path.isfile(file_path):
        return _make_err(f'文件不存在: {file_path}', 404)
    return 200, {
        '_file_download': True,
        'path': file_path,
        'filename': os.path.basename(file_path),
    }


def handle_delete_file(file_path):
    """删除指定文件"""
    if not file_path:
        return _make_err('参数 "path" 不能为空')
    # 统一转为绝对路径
    file_path = os.path.abspath(file_path)
    # 安全校验：确保路径在允许的 musicdl 输出目录范围内
    abs_work_dir = os.path.abspath(DEFAULT_MUSICDL_OUTPUT_DIR)
    if not file_path.startswith(abs_work_dir):
        return _make_err('不允许删除 musicdl_outputs 目录之外的文件', 403)
    if not os.path.exists(file_path):
        return _make_err(f'文件不存在: {file_path}', 404)
    try:
        if os.path.isfile(file_path):
            os.remove(file_path)
        elif os.path.isdir(file_path):
            import shutil
            shutil.rmtree(file_path)
        else:
            return _make_err(f'不支持删除该类型: {file_path}', 400)
        return _make_ok(message=f'已删除: {os.path.basename(file_path)}')
    except Exception as e:
        return _make_err(f'删除失败: {str(e)}', 500)


def handle_health():
    """健康检查"""
    return _make_ok({
        'status': 'healthy',
        'version': '1.0.0',
        'registered_sources': len(MusicClientBuilder.REGISTERED_MODULES),
        'active_tasks': len(_task_store_list(status_filter='running')),
    })
