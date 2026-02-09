import { defineStore } from 'pinia'

export const useFileStore = defineStore('file', {
  state: () => ({
    currentPath: '/',
    fileList: [],
    selectedFiles: [],
    loading: false
  }),
  
  getters: {
    getCurrentPath: (state) => state.currentPath,
    getFileList: (state) => state.fileList,
    getSelectedFiles: (state) => state.selectedFiles
  },
  
  actions: {
    setCurrentPath(path) {
      this.currentPath = path
    },
    
    setFileList(files) {
      this.fileList = files
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