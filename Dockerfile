FROM nginx:stable-alpine as production-stage
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
#  npm run build
#  docker build -t  docker.ednet.cn/ednetcms-panel .
#  docker push docker.ednet.cn/ednetcms-panel:latest