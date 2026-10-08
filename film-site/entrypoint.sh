#!/bin/sh

# 打印启动信息
echo "🚀 Starting CMS Application..."

# 1. 等待数据库就绪 (可选但推荐)
# 简单重试机制，防止数据库启动慢导致连接失败
until python manage.py check --database default; do
    echo "⏳ Database is unavailable - sleeping for 2s..."
    sleep 2
done

# 2. 执行数据库迁移
echo "🔄 Applying database migrations..."
python manage.py makemigrations videos
python manage.py migrate --noinput

# 3. 创建超级用户 (可选，仅首次启动或用户不存在时)
# 建议通过环境变量传递密码，避免硬编码
echo "👤 Checking superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    import os
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    User.objects.create_superuser('admin', email, password)
    print("✅ Superuser 'admin' created.")
else:
    print("ℹ️ Superuser already exists.")
EOF

# 4. 启动 Gunicorn (生产环境标准)
# --workers: 建议设置为 (2 * CPU核心数) + 1
# --bind: 绑定所有接口
echo "🌐 Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 config.wsgi:application
