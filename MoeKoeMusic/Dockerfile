FROM registry.cn-wulanchabu.aliyuncs.com/youngxj/moekoe-music:latest



EXPOSE 8080 
# For API
EXPOSE 6521 

CMD sh -c "\
  echo 'client running @ http://127.0.0.1:8080/'; \
  cd /app/api && node app.js & nginx -g 'daemon off;'"
