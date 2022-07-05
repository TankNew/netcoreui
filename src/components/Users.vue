<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{ contentTitle }}
    </p>
    <section>
      <div>
        <b-alert show dismissible>
          <b>Info:</b>
          选择快捷工具‘单页显示条目’可改变显示的条目总数。角色模块无排序功能。
        </b-alert>
      </div>
      <label><i class="fas fa-wrench mx-2 text-info"></i>快捷工具</label>
      <!-- User Interface controls -->
      <dl class="news-bar">
        <dd>
          <b-input-group size="sm">
            <b-form-input
              v-model="keyWord"
              placeholder="关键词"
              @keyup.enter.prevent="search(keyWord)"
            />
            <b-input-group-append>
              <b-btn @click="search(keyWord)">查找</b-btn>
            </b-input-group-append>
          </b-input-group>
        </dd>
        <dd>
          <b-input-group size="sm">
            <b-form-select v-model="sortBy" :options="sortOptions">
              <option slot="first" :value="null">-- 排序依据 --</option>
            </b-form-select>
            <b-form-select
              size="sm"
              :disabled="!sortBy"
              v-model="sortDesc"
              slot="append"
            >
              <option :value="false">正序</option>
              <option :value="true">倒序</option>
            </b-form-select>
          </b-input-group>
        </dd>
        <dd>
          <b-input-group size="sm" append="单页条目">
            <b-form-select size="sm" :options="pageOptions" v-model="perPage" />
          </b-input-group>
        </dd>
      </dl>
      <div class="mb-3 ml-4">
        <button type="button" class="btn btn-primary btn-sm px-5" @click="_new">
          <i class="fas fa-plus mr-1"></i>新增
        </button>
      </div>
      <div class="news-table">
        <section style="min-height: 300px">
          <b-table-simple hover responsive bordered>
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col style="width: 120px" />
            </colgroup>
            <b-thead head-variant="light">
              <b-tr>
                <b-th>用户名</b-th>
                <b-th>姓名</b-th>
                <b-th>邮箱</b-th>
                <b-th>激活</b-th>
                <b-th>操作</b-th>
              </b-tr>
            </b-thead>
            <b-tbody v-if="isBusy">
              <b-tr>
                <b-td colspan="5">
                  <div class="text-center text-info my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                  </div>
                </b-td>
              </b-tr>
            </b-tbody>
            <draggable
              v-else
              tag="b-tbody"
              :disabled="dragging"
              :list="items"
              :animation="200"
              :group="{ name: `news` }"
              :ghost-class="'ghost'"
              :move="onMove"
              @change="handleChange"
            >
              <b-tr v-for="(item, index) in items" :key="index">
                <b-td
                  ><img class="user-head" :src="item.headImage" />
                  {{ item.userName }}
                </b-td>
                <b-td>{{ item.fullName }} </b-td>
                <b-td>{{ item.emailAddress }} </b-td>
                <b-td>{{ item.isActive }} </b-td>
                <b-td>
                  <b-button
                    size="sm"
                    @click.stop="_edit(item, item.index, $event.target)"
                    class="mr-1"
                    variant="info"
                    >编辑</b-button
                  >
                  <b-button
                    size="sm"
                    @click.stop="_delete(item, item.index, $event.target)"
                    variant="dark"
                    >删除</b-button
                  >
                </b-td>
              </b-tr>
            </draggable>
            <b-tfoot>
              <b-tr>
                <b-td colspan="5" variant="light" class="text-left">
                  Total Rows:
                  <b>{{ totalRows }}</b>
                </b-td>
              </b-tr>
            </b-tfoot>
          </b-table-simple>
        </section>
        <b-pagination
          pills
          align="center"
          :total-rows="totalRows"
          :per-page="perPage"
          v-model="currentPage"
          @change="pageChange"
          class="my-0"
        />
      </div>
    </section>
    <UserEdit ref="userPanel" @load="load"></UserEdit>
  </section>
</template>
<script>
import tools from '../utiltools/tools'
import swal from 'sweetalert'
import draggable from 'vuedraggable'
import UserEdit from './UserEdit'
import { mapActions } from 'vuex'

export default {
  components: {
    UserEdit,
    draggable
  },
  data() {
    return {
      /* table设置 start*/
      items: [],
      dragging: false,
      isBusy: true,
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
      pageOptions: [5, 10, 20, 50, 100],
      sortBy: 'number',
      sortDesc: true,
      sortDirection: 'desc',
      keyWord: null,
      filter: null
    }
  },
  props: {
    contentTitle: String,
    scorllTopLength: Number
  },
  watch: {
    sortBy(val) {
      this.load()
    },
    sortDesc(val) {
      this.load()
    },
    perPage() {
      this.load()
      this.refreshScroll()
    }
  },
  computed: {
    sortOptions() {
      // Create an options list from our fields
      var fields = [
        {
          key: 'number',
          label: '顺序号',
          sortable: true,
          sortDirection: 'desc'
        },

        {
          key: 'userName',
          label: '用户名',
          sortable: true,
          sortDirection: 'asc'
        },
        { key: 'fullName', label: '姓名', sortable: true, sortDirection: 'asc' }
      ]
      return fields
        .filter(f => f.sortable)
        .map(f => {
          return { text: f.label, value: f.key }
        })
    }
  },
  methods: {
    ...mapActions([
      'getAllUsersAsync',
      'deleteUserAsync',
      'activeUserAsync',
      'deActiveUserAsync',
      'getUserLessAsync',
      'getAllUserLessesAsync',
      'moveUserAsync'
    ]),
    onMove(e) {
      if (this.dragging || this.sortBy !== 'number' || !this.sortDesc) {
        return false
      }
    },
    async handleChange(e) {
      let toIndex = e.moved.newIndex - 1
      if (e.moved.oldIndex > e.moved.newIndex) toIndex = e.moved.newIndex + 1

      let draged = e.moved.element
      let to = this.items[toIndex]
      let json = {
        id: draged.id,
        toId: to.id,
        above: to.number > draged.number
      }
      this.dragging = true
      let data = await this.moveUserAsync(json)

      if (data.success) {
        this.items[e.moved.newIndex].number = data.result.number
      }

      this.dragging = false
      this.dragUpdate = null
    },
    refreshScroll() {
      this.$emit('refreshScroll')
    },
    /**Table methods */
    search(val) {
      this.filter = val
      this.load()
    },
    formatTime(val) {
      return tools.date(val)
    },
    pageChange(val) {
      this.currentPage = val
      this.load()
    },
    async load() {
      this.isBusy = true
      let sorts = []
      let sort = this.sortBy
      if (sort !== null && sort !== undefined && sort !== '') {
        sort = sort.replace(sort[0], sort[0].toUpperCase())
        sort += ' '
        sort += this.sortDesc ? 'DESC' : 'ASC'
        sorts.push(sort)
      }
      let params = {
        params: {
          Keyword: this.filter,
          SkipCount: (this.currentPage - 1) * this.perPage,
          MaxResultCount: this.perPage,
          Sorting: sorts.toString()
        }
      }

      var data = await this.getAllUsersAsync(params)
      if (data.success) {
        var json = data.result
        this.items = json.items
        this.totalRows = json.totalCount
      }
      this.isBusy = false
    },
    //编辑
    async _edit(item, index, button) {
      this.$refs.userPanel.blockModalOpen(item, true)
    },
    //新增
    async _new() {
      this.$refs.userPanel.blockModalOpen(null, false)
    },
    async _delete(item, index, button) {
      swal({
        title: '确认吗?',
        text: '被删除数据可能无法恢复，请您再次确认!',
        icon: 'warning',
        buttons: ['取消', '确认'],
        dangerMode: true
      }).then(async confirm => {
        if (confirm) {
          await this.deleteUserAsync({ params: { id: item.id } })
          this.load()
        }
      })
    }
  },
  created() {
    this.load()
  }
}
</script> 
