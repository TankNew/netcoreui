<style lang="less" scoped>
  .breadcrumb,
  .breadcrumb a,
  .breadcrumb .active { font-size: 14px; }

  .topButton { left: auto; bottom: 50px; right: 50px; font-size: 50px; border: 4px solid rgba(0, 123, 255, 0.5); line-height: 1; border-radius: 50%; padding: 4px; opacity: 0.7; }
</style>
<template>
  <section class="main">
    <!--滚动到顶端-->
    <div class="fixed-bottom topButton">
      <a href="javascript:void(0)" @click="topClick"><i class="far fa-arrow-alt-circle-up"></i></a>
    </div>
    <!--左侧菜单设置-->
    <div :class="menuitemClasses">
      <span class="left-bar-shrink" @click="leftBarChange"><i class="fas fa-bars"></i></span>
      <h5>
        <img src="@/assets/img/logo.png" />
      </h5>
      <div class="sidebar-header">
        <div class="user-pic">
          <img class="img-responsive img-rounded mCS_img_loaded" src="static/imgs/64.png" alt="">
        </div>
        <div class="user-info">
          <span class="user-name"><strong>{{UserModel.UserName}}</strong></span>
          <span class="user-role">{{UserModel.UserRole}}</span>
          <div class="user-status">
            <a href="javascript:void(0)"><span class="btn btn-success btn-sm" style="padding:0 0.2rem;">Online</span></a>
          </div>
        </div>
      </div>
      <b-input-group size="sm">
        <b-form-input placeholder="搜索设置项"></b-form-input>
        <b-input-group-append>
          <b-btn variant="primary"><i class="fas fa-angle-right px-1"></i></b-btn>
        </b-input-group-append>
      </b-input-group>
      <div class="sidebar-menu">
        <ul>
          <li :class="[item.submenu?'sidebar-dropdown':'sidebar-link',menuIndex==index||path==item.url?'active':'']" v-for="(item,index) in menu" :key="index">
            <a href="javascript:void(0)" @click="menuClick(item,index)">
              <i :class="item.img"></i><span>{{item.title}}</span>
              <span v-if="item.isnew" class="badge badge-success">New</span>
              <span v-if="item.ispage" class="badge badge-warning">P</span>
            </a>
            <div class="sidebar-submenu" v-if="item.submenu">
              <ul>
                <li v-for="(sub,subindex) in item.submenu" :key="subindex">
                  <a href="javascript:void(0)" :class="path==sub.url?'active':''" @click="menuClick(sub,subindex)">{{sub.title}}</a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!--主体内容设置-->
    <div class="content">
      <b-navbar toggleable="md" type="dark" variant="info" style="background-color:#6699CC !important;">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
        <b-navbar-brand href="javascript:void(0)">
          网站控制台V5.0
        </b-navbar-brand>
        <b-collapse is-nav id="nav_collapse">
          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown right>
              <template slot="button-content">
                <i class="fab fa-creative-commons  mr_10"></i>语言
              </template>
              <b-dropdown-item href="javascript:void(0)">英文</b-dropdown-item>
              <b-dropdown-item href="javascript:void(0)">中文</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown right>
              <!-- Using button-content slot -->
              <template slot="button-content">
                <i class="fas fa-users-cog  mr_10"></i>用户
              </template>
              <b-dropdown-item href="javascript:void(0)">个人资料</b-dropdown-item>
              <b-dropdown-item href="javascript:void(0)" @click="logout">安全退出</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <!--内页设置-->
      <section class="content-body">
        <!-- 地址栏 -->
        <b-breadcrumb :items="breadcrumb" />
        <section ref="scroll1" class="scroll-container">
          <scroll ref="content" class="scroll" :data="scrollData" :autoScroll="false" @scrollTop="scrollTop">
            <router-view @refreshScroll="refreshScroll" @reloadScroll="reloadScroll" :scorllTopLength="scorllTopLength"></router-view>
          </scroll>
        </section>
      </section>
    </div>
    <!--底部-->
  </section>
</template>
<script>
  import tools from 'tools'
  import scroll from './custom/scroll'
  import jwtDecode from 'jwt-decode'
  export default {
    name: 'layout',
    data() {
      return {
        loadState: false, // 加载状态
        scorllTopLength: 0,
        path: '/',
        pathname: '',
        UserModel: {
          UserName: '',
          UserHead: '',
          UserRole: '',
          UserClaims: []
        },
        menu: '',
        menuIndex: -1,
        isCollapsed: false,
        breadcrumb: [],
        scrollData: [],
        clientHeight: document.body.clientHeight
      }
    },
    watch: {
      //监测当前路径
      $route(val) {
        var that = this
        that.path = val.path
        that.pathToMenu()
        that.reloadScroll()
      },
      // 监视窗口大小变化
      clientHeight(val) {
        this.refreshScroll()
      }
    },
    components: {
      scroll: scroll
    },
    computed: {
      menuitemClasses: function () {
        return ['leftBar', this.isCollapsed ? 'shrink' : '']
      }
    },
    methods: {
      //初加载同步菜单
      pathToMenu() {
        var that = this
        that.menu.forEach((m, index) => {
          if (m.url === that.path) {
            that.menuIndex = index
            that.breadcrumb = [
              {
                text: '根目录',
                to: { path: '/' }
              },
              {
                text: m.title
              }
            ]
          } else if (m.submenu) {
            m.submenu.forEach(s => {
              if (s.url === that.path) {
                that.menuIndex = index
                that.breadcrumb = [
                  {
                    text: '根目录',
                    to: { path: '/' }
                  },
                  {
                    text: m.title
                  },
                  {
                    text: s.title,
                    active: true
                  }
                ]
              }
            })
          }
        })
      },
      //侧导航
      menuClick(item, index) {
        if (!item.submenu) {
          this.$router.push({ path: item.url })
        } else this.menuIndex = index
      },
      //隐藏侧导航
      leftBarChange() {
        this.isCollapsed = !this.isCollapsed
        console.log(this.isCollapsed)
      },
      //安全退出
      logout() {
        this.$store.commit('logout')
      },
      // 返回顶部
      topClick() {
        this.$refs.content.ScrollToTop()
      },
      refreshScroll() {
        this.$refs.content.refresh()
      },
      reloadScroll() {
        if (this.loadState)
          this.$refs.content.reload()
      },
      // 调整工具栏位置
      scrollTop(val) {
        this.scorllTopLength = val
      },
      // 预加载
      load() { }
    },
    created() {
      var that = this
      that.menu = that.$store.state.menu
      that.path = that.$router.history.current.path
      that.pathToMenu()
      if (that.$store.state.Users.currentUser.UserSign !== null) {
        var decoded = jwtDecode(this.$store.state.Users.currentUser.UserSign)
        this.UserModel.UserName = decoded.unique_name
        this.UserModel.UserHead = 'static/imgs/128.png'
        that.UserModel.UserRole = 'Administrators'
        that.UserModel.UserClaims = '1,2,3'
      }
      console.log(tools.myTime.CurTime())
      //console.log(this.$store.state.Counter.main)
    },
    mounted() {
      var that = this
      window.onresize = () => {
        return (() => {
          that.clientHeight = document.body.clientHeight
        })()
      }
      that.$nextTick(() => {
        that.loadState = true
        that.reloadScroll()
      })
    },
    beforeDestory() {
      console.log('beforeDestory')
      that.loadState = false
    }
  }
</script>