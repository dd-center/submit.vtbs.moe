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
      <p class="help">语言可以是 cn, en, jp 之类的</p>
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

  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">所属社团</label>
      <p class="help">这里写社团记录的文件名, 无所属留空</p>
    </div>
    <div class="field-body">
      <div class="field">
        <div class="control"><input class="input" type="text" placeholder="社团" v-model="editing.group"></div>
      </div>
    </div>
  </div>

  <hr>

  <div class="field is-horizontal" v-for="({id, platform, type}, n) in editing.accounts" :key="`account_${n}`">
    <div class="field-label is-normal">
      <label class="label" v-if="!n">账号</label>
      <p v-if="!id || !urls[n].startsWith('http')" class="help">{{urls[n]}}</p>
      <a v-else :href="urls[n]" target="_blank" class="help">{{urls[n]}}</a>
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

  <div class="field is-grouped">
    <div class="control">
      <button class="button is-link" :class="{ 'is-loading': saving }" :disabled="!editing.fileName || saving" @click="save">保存 {{fileName}}</button>
    </div>
    <div class="control">
      <button class="button is-link is-light">复原</button>
    </div>
  </div>

  <hr>

  <code>{{code}}</code>
  <br>
</div>
</template>

<script>
import { mapState } from 'vuex'

import { saveVtb } from '@/worker'

export default {
  data() {
    const editing = {
      fileName: '',
      names: [],
      type: 'vtuber',
      bot: false,
      accounts: [],
      group: ''
    }
    return { editing, saving: false }
  },
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
      await saveVtb(this.fileName, this.code)
      this.saving = false
    }
  },
  computed: {
    ...mapState(['meta']),
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

      return file
    }
  }
}
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
}
</style>
