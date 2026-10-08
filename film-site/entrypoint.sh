#!/bin/sh

# 等待数据库就绪 (可选，如果使用了 docker-compose 依赖项，通常不需要复杂的等待逻辑，但加上更稳健)
echo "Waiting for database..."
# 这里可以添加简单的 nc 检查或 python 脚本检查数据库连接

# 执行数据库迁移
echo "Running migrations..."
python manage.py migrate --noinput

# 收集静态文件 (如果在 Dockerfile 中未执行，或需要增量更新)
# echo "Collecting static files..."
# python manage.py collectstatic --noinput

# 创建超级用户 (可选)
# 注意：这会在每次容器重启时尝试创建，如果已存在则会报错并忽略，或者你可以编写更复杂的逻辑
echo "Creating superuser if not exists..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'password')
    print("Superuser created.")
else:
    print("Superuser already exists.")
EOF

# 执行传入的命令 (即 CMD 中的 gunicorn)
exec "$@"
