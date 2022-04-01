#!/bin/zsh
echo "Start Build !"
work_path=$(dirname $(readlink -f $0))
cd ${work_path}

npm run build
docker build -t docker.ednet.cn/ednetcms-panel .
# docker-compose up --build --no-deps -d ednetcms-panel
docker push docker.ednet.cn/ednetcms-panel
docker rmi $(docker images -f "dangling=true" -q)
