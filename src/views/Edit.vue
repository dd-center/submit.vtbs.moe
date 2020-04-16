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
    </div>
  </div>

  <hr>

  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">记录类型</label>
      <p class="help" v-if="editing.type === 'group'">请为每个社团成员创建单独的记录，不要把成员的账号放进社团的记录</p>
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

  <div class="field is-horizontal" v-for="({id, platform, type}, n) in editing.accounts" :key="`account_${n}`">
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
      </div>
    </div>
  </div>

  <hr>

  <code>{{code}}</code>
  <br>
</div>
</template>

<script>
import { mapState } from 'vuex'

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
    this.backup = JSON.stringify(editing)
    this.blank = JSON.stringify(editing)

    return { editing, saving: false, saved: false, rest: {}, groupList: [] }
  },
  watch: {
    editing: {
      deep: true,
      handler() {
        this.saved = false
      }
    },
    file: {
      immediate: true,
      async handler(file, oldFile) {
        if (file !== oldFile) {
          if (file) {
            this.editing.fileName = file.replace('.json', '')
            const json = await getVtbJson(file)
            const { accounts = {}, name = {}, type, bot, group, ...rest } = json

            Object.entries(name)
              .flatMap(([lang, names]) => [names].flat().map(n => [lang, n]))
              .forEach(([lang, n]) => this.editing.names.push([lang, n]))

            Object.entries(accounts)
              .flatMap(([platform, ids]) => [ids].flat().map(id => [platform, id]))
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
    async save() {
      this.saving = true
      if (this.file) {
        await deleteVtb(this.file)
      }
      await saveVtb(this.fileName, this.data)
      this.saving = false
      this.saved = true
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

.url {
  word-break: break-all;
}
</style>
