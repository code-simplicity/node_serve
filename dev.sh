#!/bin/bash

export NODE_ENV=development
export DATA_PATH=./data

# 为整个文件夹添加操作权限
chmod -R 755 .

# 创建必要的目录
mkdir -p "${DATA_PATH}/nginx/conf"

# 复制 nginx.conf 到目标目录
cp ./config/nginx.conf "${DATA_PATH}/nginx/conf"

# 构建并启动开发环境
docker compose -f docker-compose-dev.yml up -d