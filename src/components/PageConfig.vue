<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      栏目设定
    </p>
    <div class="mr-3">
      <b-alert show dismissible>
        <b>Info:</b>拖动栏目可以自由排序. 自定义栏目最大扩展2层
      </b-alert>
    </div>
    <section class="pages">
      <!--第一层-->
      <ul class="o1">
        <li>
          <div class="tooltip"></div>
          <a @mouseover="imgtools('o1'+0,true)" @mouseout="imgtools('o1'+0,false)">
            <div v-show="imgtools_isshow('o1'+0)" class="img-cover-toolbar ">
              <button type="button" class="btn btn-success btn-xs del" @click="add(0,pages)"><i class="fas fa-plus" aria-hidden="true"></i></button>
            </div>
            网站根目录
          </a>
          <div class="o-line-down" v-if="pages.length>0"></div>
          <!--第二层-->
          <ul :class="['o2',pages.length>1?'border-left':'']">
            <li v-for="(item1,index1) in pages" :key="index1" v-dragging="{ item: item1, list:pages, group: 'o1'+0}">
              <div class="o-line-up"></div>
              <a @mouseover="imgtools('o2'+0+index1,true)" @mouseout="imgtools('o2'+0+index1,false)">
                <div v-show="imgtools_isshow('o2'+0+index1)" class="img-cover-toolbar ">
                  <button type="button" class="btn btn-info btn-xs edit" @click="edit(index1,item1)"><i class="fas fa-pencil-alt" aria-hidden="true"></i></button>
                  <button type="button" class="btn btn-success btn-xs del" @click="add(index1,item1.subpage)"><i class="fas fa-plus" aria-hidden="true"></i></button>
                  <button type="button" class="btn btn-danger btn-xs del" @click="del(index1,pages)"><i class="fas fa-minus" aria-hidden="true"></i></button>
                </div>
                {{item1.name}}
              </a>
              <div class="o-line-down" v-if="item1.subpage.length>0"></div>
              <!--第三层-->
              <ul :class="['o3',item1.subpage.length>1?'border-left':'']">
                <li v-for="(item2,index2) in item1.subpage" :key="index2" v-dragging="{ item: item2, list: item1.subpage, group: 'o2'+index1}">
                  <div class="o-line-up"></div>
                  <a @mouseover="imgtools('o3'+index1+index2,true)" @mouseout="imgtools('o3'+index1+index2,false)">
                    <div v-show="imgtools_isshow('o3'+index1+index2)" class="img-cover-toolbar ">
                      <button type="button" class="btn btn-info btn-xs edit" @click="edit(index2,item2)"><i class="fas fa-pencil-alt" aria-hidden="true"></i></button>
                      <button type="button" class="btn btn-danger btn-xs del" @click="del(index2,item1.subpage)"><i class="fas fa-minus" aria-hidden="true"></i></button>
                    </div>
                    {{item2.name}}
                  </a>
                </li>
              </ul>
              <!--第三层-->
            </li>
          </ul>
          <!--第二层-->
        </li>
      </ul>
      <!--第一层-->
    </section>
    <section class="subbar">
      <button class="form-inline btn btn-success px-5" type="button" @click="submit">提交</button>
      <button class="form-inline btn btn-default px-5" type="button" @click="reset">重置</button>
    </section>
    <!--弹出修改层-->
    <b-modal id="modalPrevent"
             ref="pageModal"
             :title="editMode?'编辑':'新增'"
             @ok="handleOk"
             @shown="clearName">
      <form @submit.stop.prevent="handleSubmit">

        <b-input-group size="sm" prepend="栏目名称" class="mb-3">
          <b-form-input></b-form-input>
        </b-input-group>
        <b-input-group size="sm" prepend="栏目链接" class="mb-3">
          <b-form-input></b-form-input>
        </b-input-group>
        <b-input-group size="sm" prepend="栏目类型" class="mb-3">
          <b-form-radio-group size="sm" :options="['新闻', '产品', '编辑器','自定义页面一','新闻', '产品', '编辑器','自定义页面一']" />
        </b-input-group>
      </form>
    </b-modal>
  </section>
</template>
<script>
  export default {
    data() {
      return {
        pages: [
          {
            name: '首页',
            active: false,
            url: '',
            subpage: []
          },
          {
            name: '关于我们',
            active: false,
            url: '',
            subpage: [
              {
                name: '公司简介',
                url: '',
                active: false
              },
              {
                name: '资质证书',
                url: '',
                active: false
              },
              {
                name: '经营理念',
                url: '',
                active: false
              },
              {
                name: '大事记',
                url: '',
                active: false
              }
            ]
          },
          {
            name: '公司动态',
            url: '',
            active: false,
            subpage: [
              {
                name: '公司新闻',
                url: '',
                active: false
              },
              {
                name: '公司视频',
                url: '',
                active: false
              }
            ]
          },
          {
            name: '人才招聘',
            url: '',
            active: false,
            subpage: []
          },
          {
            name: '联系我们',
            url: '',
            active: false,
            subpage: []
          }
        ],
        hoverid: -1,
        page: {
          name: '',
          active: false,
          subpage: []
        },
        editMode: false,
        name: ''
      }
    },
    methods: {
      imgtools: function (index, bool) {
        if (bool)
          this.hoverid = index
        else
          this.hoverid = -1
      },
      imgtools_isshow: function (index) {
        return index === this.hoverid
      },
      add(index, item) {
        this.editMode = false
        this.$refs.pageModal.show()
      },
      edit(index, item) {
        this.$refs.pageModal.show()
        this.editMode = true
      },
      del(index, item) { },
      submit() { },
      reset() { },
      clearName() {
        this.name = ''
      },
      handleOk(evt) {
        // Prevent modal from closing
        evt.preventDefault()
        if (!this.name) {
          alert('Please enter your name')
        } else {
          this.handleSubmit()
        }
      },
      handleSubmit() {
        this.names.push(this.name)
        this.clearName()
        this.$refs.modal.hide()
      },
      load() {
      }
    },
    created: function () {
      var that = this
      that.load()
    },
    mounted() {
      var that = this
      // 开发调试
      that.$nextTick(() => {
        that.$emit('reloadScroll')
      })
    }
  }
</script>
<style scoped>
  /*组织结构图设定*/
  .pages { font-size: 14px; letter-spacing: 5px; overflow: hidden; width: 100%; padding: 0 10px; min-height: 450px; }
    .pages ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: center; align-content: center; float: left; }
    .pages li { text-align: center; flex-shrink: 0; }
    .pages a { display: block; text-align: center; color: #333; background-color: #fff; padding: 10px 5px; margin: 5px; box-sizing: border-box; cursor: pointer; writing-mode: vertical-lr; float: left; height: 120px; position: relative; border-radius: 5px; border: 1px solid #ccc; }

      .pages a > span { position: fixed; z-index: 999; width: 320px; border-radius: 5px; border: 4px solid #ccc; top: 50%; left: calc(50% - 160px); display: block; box-sizing: border-box; }
        .pages a > span > img { width: 312px; }
      .pages a:hover { background-color: #ccc; text-decoration: none; }

  .o-line-up { float: left; }
  .o-line-down { float: left; }

  .o-line-up { position: relative; padding-left: 10px; height: 40px; }
    .o-line-up:after { content: ''; position: absolute; top: 20px; left: 0; border-top: 1px solid #ccc; width: 15px; }

  .o-line-down { position: relative; padding-left: 10px; height: 40px; }
    .o-line-down:before { content: ''; position: absolute; left: -5px; top: 20px; border-top: 1px solid #ccc; width: 15px; }

  .pages a { padding: 10px; writing-mode: horizontal-tb; width: 120px; letter-spacing: 3px; height: auto; }
  .border-left { margin-bottom: 20px !important; }
    .border-left > li { border-left: 1px solid #ccc; }

  .subbar { border-top: 1px solid #ccc; padding: 10px 20px; }
  /*鼠标滑过工具显示*/
  .img-cover-toolbar { position: absolute; left: 0; top: 0; background: rgba(0,0,0,0.5); padding: 5px; width: 100%; height: 100%; box-sizing: border-box; }
    .img-cover-toolbar button { border-radius: 50%; font-size: 12px; padding: 4px 8px; }
</style>
