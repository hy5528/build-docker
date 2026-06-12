onst express = require('express');
const http = require('http');
const path = require('path');

const sourcesRoutes = require('./routes/sources');
const categoriesRoutes = require('./routes/categories');
const videosRoutes = require('./routes/videos');
const settingsRoutes = require('./routes/settings');
const proxyRoutes = require('./routes/proxy');
const favoritesRoutes = require('./routes/favorites');
const historyRoutes = require('./routes/history');
const multiSourceRoutes = require('./routes/multi-source');

async function startServer() {
    try {
        console.log('[videox] Initializing standalone backend...');

        // 初始化数据库
        const db = initDatabase();

        // 启动后台扫描服务
        try {
            const { scanQueueService } = require('./services/ScanQueueService');
            setTimeout(() => {
                scanQueueService.start();
                console.log('[videox] Background scan queue started');
            }, 5000);
        } catch (queueError) {
            console.error('[videox] Failed to load ScanQueueService:', queueError.stack);
        }

        const app = express();
        const server = http.createServer(app);

        // 中间件
        app.use(express.json());

        // 跨域设置 (仅开发模式或根据需要配置)
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Password');
            if (req.method === 'OPTIONS') return res.sendStatus(200);
            next();
        });

        // 健康检查
        app.get('/api/health', (req, res) => {
            res.json({ status: 'healthy', service: 'videox', mode: 'standalone' });
        });

        // API 路由 (直接挂载到 /api，不再经过 gateway 路径)
        app.use('/api/sources', sourcesRoutes);
        app.use('/api/categories', categoriesRoutes);
        app.use('/api/videos', videosRoutes);
        app.use('/api/settings', settingsRoutes);
        app.use('/api/proxy', proxyRoutes);
        app.use('/api/favorites', favoritesRoutes);
        app.use('/api/history', historyRoutes);
        app.use('/api/multi-source', multiSourceRoutes);
        app.use('/api/home', require('./routes/home'));
        app.use('/api/tv', require('./routes/tv'));
        app.use('/api/live', require('./routes/live'));
        app.use('/api/netdisk', require('./routes/netdisk'));
        app.use('/api/transcode', require('./routes/transcode'));
        app.use('/api/media-servers', require('./routes/media-servers'));

        // 全站访问密码中间件 (仅对 API 路由生效)
        app.use(async (req, res, next) => {
            // 只对 API 路径进行密码验证，静态资源不受限制
            if (!req.path.startsWith('/api')) {
                return next();
            }

            // 排除健康检查等公开接口
            if (req.path === '/api/health' || req.path === '/api/settings/verify-site-password') {
                return next();
            }

            try {
                const enabledSetting = db.get("SELECT value FROM settings WHERE key = 'site_password_enabled'");
                const passwordSetting = db.get("SELECT value FROM settings WHERE key = 'site_password'");

                // 兼容字符串和布尔值
                const isPasswordEnabled = enabledSetting?.value === 'true' || enabledSetting?.value === true;

                if (!isPasswordEnabled) {
                    return next();
                }

                const sitePassword = req.headers['x-site-password'];
                const storedPassword = passwordSetting?.value || '';

                if (sitePassword === storedPassword) {
                    return next();
                }

                console.warn(`[SiteGuard] Blocked request to ${req.path}. Password mismatch.`);
                return res.status(401).json({
                    success: false,
                    error: 'SITE_LOCKED',
                    message: '站点已锁定，请输入访问密码'
                });
            } catch (err) {
                console.error('[videox] Site password middleware error:', err);
                next();
            }
        });

        // 静态文件服务 - 前端资源
        const frontendPath = path.join(__dirname, '../frontend/dist');
        app.use(express.static(frontendPath));

        // SPA fallback - 所有未匹配的路由返回 index.html
        app.get('*', (req, res) => {
            // 排除 API 路由
            if (req.path.startsWith('/api')) {
                return res.status(404).json({ error: 'Not Found' });
            }
            res.sendFile(path.join(frontendPath, 'index.html'));
        });

        const PORT = 3100;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`[videox] Standalone backend listening on port ${PORT}`);
            console.log(`[videox] Frontend served from: ${frontendPath}`);
        });

    } catch (error) {
        console.error('[videox] CRITICAL STARTUP ERROR:', error.stack);
        process.exit(1);
    }
}

// 启动
startServer();
