<template>
<div class="container">
  <br>

  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">文件名</label>
      <p class="help">一般用名字</p>
    </div>
    <div class="field-body">
      <div class="field has-addons">
        <div class="control"><input class="input" type="text" placeholder="文件名" v-model="editing.fileName"></div>
        <div class="control"><a class="button is-static">.json</a></div>
        <div class="control">
          <p class="help warn is-danger" v-if="msg.filename">{{msg.filename}}</p>
        </div>
      </div>
    </div>
  </div>

  <hr>

  <div class="field is-horizontal" v-for="(name, n) in editing.names" :key="`name_${n}`">
    <div class="field-label is-normal">
      <label class="label" v-if="!n">名字</label>
      <p class="help" v-if="!n">语言可以是 cn, en, jp 之类的</p>
    </div>
    <div class="field-body">
      <div class="field has-addons">
        <div class="control"><input class="input" type="text" placeholder="语言" v-model="editing.names[n][0]"></div>
        <div class="control"><input class="input" type="text" placeholder="名字" v-model="editing.names[n][1]"></div>
        <div class="control"><button class="button is-danger" @click="deleteName(n)">删除</button></div>
      </div>
    </div>
  </div>

  <div class="field is-horizontal">
    <div class="field-label">
    </div>
    <div class="field-body">
      <button class="button is-link" @click="addName">添加名字</button>
      <div class="control">
        <p class="help warn is-danger" v-if="msg.name">{{msg.name}}</p>
      </div>
    </div>
  </div>

  <hr>

  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">记录类型</label>
      <p class="help" v-if="editing.type === 'group'">请为每个社团成员创建单独的文件，不要把成员的账号放进社团的文件</p>
    </div>
    <div class="field-body">
      <div class="field">
        <div class="select">
          <select v-model="editing.type">
            <option value="vtuber">虚拟主播</option>
            <option value="group">社团</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">是不是机器人</label>
      <p class="help">就是24*7那样的</p>
    </div>
    <div class="field-body">
      <div class="field">
        <label class="checkbox">
          <input type="checkbox" v-model="editing.bot">
          机器人
        </label>
      </div>
    </div>
  </div>

  <hr>

  <div class="field is-horizontal" v-for="({id}, n) in editing.accounts" :key="`account_${n}`">
    <div class="field-label is-normal">
      <label class="label" v-if="!n">账号</label>
      <p v-if="!id || !urls[n].startsWith('http')" class="help url">{{urls[n]}}</p>
      <a v-else :href="urls[n]" target="_blank" class="help url">{{urls[n]}}</a>
    </div>
    <div class="field-body">
      <div class="field has-addons">
        <div class="control">
          <div class="select">
            <select v-model="editing.accounts[n].platform">
              <option v-for="[platformName] in platforms" :key="`account_${n}_${platformName}`" :value="platformName">{{platformName}}</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>
        <div class="control"><input class="input" type="text" placeholder="{id}" v-model="editing.accounts[n].id"></div>
        <div class="control"><button class="button is-danger" @click="deleteAccount(n)">删除</button></div>
      </div>
    </div>
  </div>

  <div class="field is-horizontal">
    <div class="field-label">
    </div>
    <div class="field-body">
      <button class="button is-link" @click="addAccount">添加账号</button>
    </div>
  </div>

  <hr>

  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">所属社团</label>
      <p class="help">这里写所属社团记录的文件名<br>(不需要文件后缀)</p>
      <p class="help">无所属留空</p>
    </div>
    <div class="field-body">
      <div class="field">
        <div class="control"><input class="input" type="text" placeholder="社团" v-model="editing.group"></div>
        <button class="button is-text" v-for="group in groupAuto" :key="`groupAuto_${group}`" @click="editing.group = group">{{group}}</button>
      </div>
    </div>
  </div>

  <hr>

  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <p class="help" v-if="saved">保存成功!</p>
      <p class="help is-danger" v-if="failed">格式错误，请检查上面的输入!</p>
    </div>
    <div class="field-body">
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-link" :class="{ 'is-loading': saving }" :disabled="!editing.fileName || saving" @click="save">保存 {{fileName}}</button>
        </div>
        <div class="control">
          <button class="button is-link is-light" @click="reset">复原</button>
        </div>
        <div class="control">
          <router-link class="button is-light" tag="button" to="/">返回</router-link>
        </div>
        <div class="control">
          <button class="button is-danger" @click="remove" :disabled="!file">删除</button>
        </div>
      </div>
    </div>
  </div>

  <hr>

  <code>{{code}}</code>
  <br>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { saveVtb, getVtbJson, deleteVtb, getGroupList } from '@/worker'

export default {
  props: ['file'],
  data() {
    const editing = {
      fileName: '',
      names: [],
      type: 'vtuber',
      bot: false,
      accounts: [],
      group: ''
    }
    this.msg = {}
    this.backup = JSON.stringify(editing)
    this.blank = JSON.stringify(editing)

    return { editing, saving: false, saved: false, saveReset: true, failed: false, rest: {}, groupList: [] }
  },
  watch: {
    editing: {
      deep: true,
      handler() {
        if (this.saveReset) {
          this.saved = false
        } else {
          this.saveReset = true
        }
        this.failed = false
      }
    },
    'editing.fileName': {
      handler() {
        this.checkFileName()
      }
    },
    'editing.names': {
      deep: true,
      handler() {
        this.checkName()
      }
    },
    file: {
      immediate: true,
      async handler(file, oldFile) {
        if (file !== oldFile) {
          if (file) {
            const { accounts = {}, name = {}, type, bot, group, ...rest } = await getVtbJson(file)
            this.saveReset = false
            this.editing = JSON.parse(this.blank)
            this.editing.fileName = file.replace('.json', '')

            Object.entries(name)
              .flatMap(([lang, names]) => [names].flat().map(n => [lang, n]))
              .forEach(([lang, n]) => this.editing.names.push([lang, n]))

            Object.entries(accounts)
              .flatMap(([platform, ids]) => [ids].flat().map(id => [platform, id]))
              .map(([platform, id]) => [platform, id.id || id])
              .forEach(([platform, id]) => this.editing.accounts.push({ platform, id }))

            if (type) {
              this.editing.type = type
            }

            if (bot) {
              this.editing.bot = bot
            }

            if (group) {
              this.editing.group = group
            }

            this.backup = JSON.stringify(this.editing)

            this.rest = rest
          } else {
            this.backup = this.blank
            this.rest = {}
            this.reset()
          }
        }
        this.groupList = await getGroupList()
      }
    }
  },
  async mounted() {},
  methods: {
    ...mapActions(['loadFileList']),
    addName() {
      this.editing.names.push(['', ''])
    },
    deleteName(n) {
      this.editing.names.splice(n, 1)
    },
    addAccount() {
      this.editing.accounts.push({ id: '', platform: 'bilibili' })
    },
    deleteAccount(n) {
      this.editing.accounts.splice(n, 1)
    },
    checkFileName() {
      this.msg.filename = '\\/:*"<>|'.split('').some(char => this.editing.fileName.includes(char)) ? '非法文件名' : undefined
      return !this.msg.filename
    },
    checkName() {
      if (this.editing.names.length === 0) {
        this.msg.name = '未填写名称'
        return false
      }
      for (const pair of this.editing.names) {
        if (!pair[0]) {
          this.msg.name = '未填写语言'
          return false
        }
        if (' ,:*\\/'.split('').some(char => pair[0].includes(char))) {
          this.msg.name = '名称语言无效'
          return false
        }
      }
      this.msg.name = undefined
      return true
    },
    async remove() {
      await deleteVtb(this.file)
      this.$router.push('/')
    },
    async save() {
      this.saving = true
      if (this.checkFileName() && this.checkName()) {
        if (this.file) {
          await deleteVtb(this.file)
        }
        await saveVtb(this.fileName, this.data)
        this.saving = false
        this.saved = true
        await this.loadFileList()
        if (this.file !== this.fileName) {
          this.$router.push(`/edit/${this.fileName}`)
        }
      } else {
        this.saving = false
        this.failed = true
      }
    },
    reset() {
      this.editing = JSON.parse(this.backup)
    }
  },
  computed: {
    ...mapState(['meta']),
    groupAuto() {
      const input = this.editing.group
      const keys = input.toLowerCase().split(' ').filter(Boolean)
      const result = this.groupList
        .filter(group => keys.every(key => group.toLowerCase().includes(key)))
      if (result.length === 1 && result[0] === input) {
        return []
      }
      return result
    },
    platforms() {
      return Object.entries(this.meta.linkSyntax)
    },
    linkSyntax() {
      return { ...this.meta.linkSyntax, other: '请直接输入完整链接' }
    },
    urls() {
      return this.editing.accounts
        .map(({ platform, id }) => ({ platform, id: !id ? '{id}' : id }))
        .map(({ platform, id }) => this.linkSyntax[platform].replace('{id}', id))
    },
    fileName() {
      return `${this.editing.fileName}.json`
    },
    code() {
      return JSON.stringify(this.data, undefined, 2)
    },
    data() {
      const file = {}

      const { accounts, group, names, type, bot } = this.editing

      if (names.length) {
        file.name = {}
        names.forEach(([lang, name]) => {
          if (!file.name[lang]) {
            file.name[lang] = name
          } else {
            file.name[lang] = [file.name[lang], name].flat()
          }
        })
      }

      if (accounts.length) {
        file.accounts = {}
        accounts.forEach(({ id, platform }) => {
          if (!file.accounts[platform]) {
            file.accounts[platform] = id
          } else {
            file.accounts[platform] = [file.accounts[platform], id].flat()
          }
        })
      }

      if (type !== 'vtuber') {
        file.type = type
      }

      if (bot) {
        file.bot = true
      }

      if (group) {
        file.group = group
        if (file.group.endsWith('.json')) {
          file.group = file.group.replace('.json', '')
        }
      }

      return { ...this.rest, ...file }
    }
  }
}
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
}

.warn {
  font-size: 1rem;
  margin: 10px;
}

.url {
  word-break: break-all;
}
</style>
