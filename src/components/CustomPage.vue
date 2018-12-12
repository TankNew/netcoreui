<template>
  <section class="container-fluid">
    <!--自定义栏目新增/修改-->
    <section v-if="editMode" class="mr-3">
      <section>
        <p class="lead">
          <i class="fas fa-columns text-primary mr-1"></i>
          自定义栏目
        </p>
        <div class="w-50" style="min-width:640px;">
          <b-form @submit="onSubmit" @reset="onReset" v-if="show" autocomplete="off">
            <b-form-group id="exampleInputGroup1"
                          label="标识名称:"
                          label-for="exampleInput1"
                          description="设置一个便于您识别的标识名称，该名称不会显示在任何前端页面中.">
              <b-form-input id="exampleInput1"
                            type="text"
                            v-model="page.name"
                            placeholder="输入一个标识名称"
                            required>
              </b-form-input>
            </b-form-group>
            <b-form-group id="exampleInputGroup2"
                          label="备注:"
                          label-for="exampleInput2">
              <b-form-input id="exampleInput2"
                            type="text"
                            v-model="page.info"
                            placeholder="简单描述这个自定义栏目"
                            required>
              </b-form-input>
            </b-form-group>

            <button type="button" class="btn btn-primary btn-sm mb-3" @click="rowadd">
              <i class="fas fa-plus mr-2"></i>新增字段
            </button>

            <b-form-group v-for="(rtem,rid) in page.rows" :key="rid">
              <b-input-group prepend="字段名称" size="sm">
                <b-form-input v-model="rtem.key"></b-form-input>
                <div slot="append" class="ml-1">
                  <button type="button" :class="['btn', 'btn-outline-secondary','btn-sm', 'mr-1', rtem.type==item.name?'active':'']" v-for="(item,index) in basicSections" :key="index" @click="rtem.type=item.name">
                    {{item.name}}
                  </button>
                  <b-link class="card-link text-danger" @click="rowdel(rid)">
                    <i class="fas fa-minus-circle"></i>
                  </b-link>
                </div>
              </b-input-group>
            </b-form-group>

            <hr />

            <b-button type="submit" variant="primary">确认</b-button>
            <b-button type="reset" variant="light">重置</b-button>
          </b-form>
        </div>
      </section>

    </section>
    <!--栏目总览-->
    <section v-else>
      <b-alert show dismissible class="small">
        <b>Info:</b>自定义栏目是使用基本栏目进行自由组合，预设栏目是系统使用基本栏目进行的预设组合
      </b-alert>
      <section>
        <p class="lead">
          <i class="fas fa-columns text-secondary mr-1"></i>
          基本栏目
        </p>
        <div class="mb-3">
          <button class="btn btn-outline-secondary mr-3" v-for="(item,index) in basicSections" :key="index">
            {{item.name}}
          </button>
        </div>
      </section>

      <hr />
      <section>
        <p class="lead">
          <i class="fas fa-columns text-info mr-1"></i>
          预设栏目
        </p>
        <div class="mb-3">
          <button class="btn btn-outline-info mr-3" v-for="(item,index) in sections" :key="index">
            {{item.name}}
          </button>
        </div>
      </section>

      <hr />

      <section>
        <p class="lead">
          <i class="fas fa-columns text-primary mr-1"></i>
          自定义栏目
          <button type="button" class="btn btn-primary btn-sm float-right" @click="add">
            <i class="fas fa-plus mr-2"></i>新增
          </button>
        </p>

        <div class="custom-page-list">
          <b-card-group deck class="mb-3">
            <b-card border-variant="primary" v-for="(item,index) in customSections" :key="index"
                    :header="(index+1)+'.'+item.name"
                    :sub-title="item.createtime"
                    align="center">
              <p class="card-text">{{item.info}}</p>
              <button class="btn btn-sm btn-link" @click="edit(item)">编辑</button>
              <button class="btn btn-sm btn-link" @click="del(index)">移除</button>
            </b-card>
          </b-card-group>
        </div>
      </section>
    </section>

  </section>
</template>
<script>
  export default {
    data() {
      return {
        page: { name: '', info: '', rows: [], createtime: '' },
        editRow: {},
        show: true,
        editMode: false,
        isEditMode: false,
        //基本栏目
        basicSections: [
          {
            name: '文本框',
            type: 'varchar(max)',
            components: 'newsManage'
          },
          {
            name: '文本区域',
            type: 'varchar(max)',
            components: 'newsManage'
          },
          {
            name: '文本编辑器',
            type: 'varchar(max)',
            components: 'newsManage'
          },
          {
            name: '图片',
            type: 'varchar(max)',
            components: 'newsManage'
          }
        ],
        //预设栏目
        sections: [
          {
            name: '新闻',
            components: 'newsManage'
          },
          {
            name: '产品',
            components: 'newsManage'
          },
          {
            name: '视频',
            components: 'newsManage'
          },
          {
            name: '招聘',
            components: 'newsManage'
          },
          {
            name: '大事记',
            components: 'newsManage'
          },
          {
            name: '留言板',
            components: 'newsManage'
          },
          {
            name: '友情链接',
            components: 'newsManage'
          }
        ],
        //自定义栏目
        customSections: [
          {
            name: '自定义模板一',
            createtime: '2018-10-12',
            info: '无',
            rows: [
              {
                key: 'title',
                type: '文本框'
              },
              {
                key: 'img',
                type: '图片'
              },
              {
                key: 'info',
                type: '文本区域'
              },
              {
                key: 'content',
                type: '文本编辑器'
              }
            ]
          }
        ]
      }
    },
    methods: {
      onSubmit(evt) {
        evt.preventDefault()
        if (!this.isEditMode)
          this.customSections.push(this.page)
        else {
          this.editRow.name = this.page.name
          this.editRow.info = this.page.info
          this.editRow.rows = this.page.rows
          console.log(this.editRow)
        }
        this.editMode = !this.editMode
      },
      onReset(evt) {
        evt.preventDefault()
        /* Reset our form values */
        this.page = JSON.parse(JSON.stringify(this.editRow))
        /* Trick to reset/clear native browser form validation state */
        this.show = false
        this.$nextTick(() => { this.show = true })
      },
      rowadd() {
        let newkey = {
          key: '',
          type: '文本框'
        }
        this.page.rows.push(newkey)
      },
      rowdel(index) {
        this.page.rows.splice(index, 1)
      },
      add() {
        this.isEditMode = false
        this.editMode = !this.editMode
      },
      edit(val) {
        this.isEditMode = true
        this.editRow = val
        this.page = JSON.parse(JSON.stringify(val))
        this.editMode = !this.editMode
      },
      del(index) {
        this.customSections.splice(index, 1)
      }
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
  .custom-page-list .card { min-width: calc(25% - 30px); max-width: calc(25% - 30px); margin-bottom: 10px; }
  .custom-page-tools .card { height: 100%; }
</style>
