# COMMON PATHS

$buildFolder = (Get-Item -Path "./" -Verbose).FullName
 
# Mvc
Set-Location $buildFolder
npm run build
docker build -t docker.ednet.cn/ednetcms-panel .
 
# 更新docker
Set-Location ~
docker-compose up --build --no-deps -d ednetcms-panel
docker rmi $(docker images -f "dangling=true" -q)
## FINALIZE ###################################################################

Set-Location $buildFolder