import { defineStore } from 'pinia'

export const useFileStore = defineStore('file', {
  state: () => ({
    currentPath: '/',
    currentFolderId: 0,      // 当前所在文件夹ID（0=根目录）
    fileList: [],
    selectedFiles: [],
    loading: false
  }),

  getters: {
    getCurrentPath: (state) => state.currentPath,
    getCurrentFolderId: (state) => state.currentFolderId,
    getFileList: (state) => state.fileList,
    getSelectedFiles: (state) => state.selectedFiles
  },

  actions: {
    setCurrentPath(path) {
      this.currentPath = path
    },

    setCurrentFolderId(id) {
      this.currentFolderId = id
    },

    setFileList(files) {
      this.fileList = Array.isArray(files) ? files : []
    },

    setSelectedFiles(files) {
      this.selectedFiles = files
    },

    setLoading(loading) {
      this.loading = loading
    },

    addFile(file) {
      this.fileList.push(file)
    },

    removeFile(fileId) {
      this.fileList = this.fileList.filter(file => String(file.id) !== String(fileId))
    }
  }
})
