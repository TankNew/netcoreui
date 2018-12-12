const state = [
  {
    'title': '起始页',
    'img': 'fas fa-h-square',
    'url': '/home/hello'
  },
  {
    'title': '基本信息',
    'img': 'fas fa-address-card',
    'url': '/home/contact'
  },
  {
    'title': '版面设定',
    'img': 'fas fa-copy',
    'isnew': true,
    'submenu': [
      {
        'title': '栏目设定',
        'url': '/home/pages'
      },
      {
        'title': '自定义栏目',
        'url': '/home/custompage'
      }
    ]
  },
  {
    'title': 'Banner',
    'img': 'fas fa-images',
    'isnew': true,
    'url': '/home/banner'
  },
  {
    'title': '企业动态',
    'img': 'fab fa-creative-commons-by',
    'ispage': true,
    'submenu': []
  },
  {
    'title': '公告认证',
    'img': 'fab fa-creative-commons-by',
    'ispage': true,
    'submenu': []
  },
  {
    'title': '系统设置',
    'img': 'fas fa-cog',
    'url': '/home/setting'
  },
  {
    'title': '人员管理',
    'img': 'fas fa-user-lock',
    'url': '/home/news'
  },
  {
    'title': '站点统计',
    'img': 'fas fa-chart-bar',
    'url': '/home/charts'
  }
]

export default {
  state
}
