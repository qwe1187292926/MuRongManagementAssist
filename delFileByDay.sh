#!/bin/bash
. /etc/profile
. ~/.bash_profile
between_day_filter=7
search_dir="/home/admin/bpcp/temp/abc"

if [ $2 ]; then
  search_dir=$2
  echo "[搜索目录]为$search_dir"
else
  echo "[搜索目录]未传入初始值,默认值:$search_dir"
fi

if [ $1 ]; then
  between_day_filter=$1
  echo "[保存天数]为$between_day_filter(天)"
else
  echo "[保存天数]未传入初始值,默认值:$between_day_filter"
fi

cd $search_dir

#删除文件
find $search_dir -ctime +$between_day_filter -type f -delete

#压缩文件
#find $search_dir -ctime +$between_day_filter -type f -exec gzip

#删除空目录
find $search_dir -type d -empty |grep -x $search_dir -v|xargs rm -rfd
