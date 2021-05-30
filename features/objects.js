const def = 'default'

const AppendixTypes = {
     success: {
          icon: '<:appendix_success:843390419429883924>'
   ***REMOVED***
     info: {
          icon: '<:appendix_info:843390419261194300>'
   ***REMOVED***
     warning: {
          icon: '<:appendix_warning:843390419270107136>'
   ***REMOVED***
     error: {
          icon: '<:appendix_error:843390419303661569>'
     }
}

// see setpay.js for appendix usage example
function Appendix() {
     let initialized = false
     this.content = ''

     /**
      * internal function
      * @param {string} value - value param of parent function
      * @param {string} type - type of appendix field
      */
     const addField = (value, type) => {
          if (!AppendixTypes[type]) throw new Error(`Appendix Error: no field type '${type}' exists`)
          if (!initialized) {
               this.content = `\n${this.content}`
               initialized = true
          }
          this.content = `${this.content}\n${AppendixTypes[type].icon} ${value}`
     }

     /**
      * adds an error appendix field
      * @param {string} value - the content of the appendix field
      */
     this.addError = (value) => {
          addField(value, 'error')
     }

     /**
      * adds a success appendix field
      * @param {string} value - the content of the appendix field
      */
     this.addSuccess = (value) => {
          addField(value, 'success')
     }

     /**
      * adds an info appendix field
      * @param {string} value - the content of the appendix field
      */
     this.addInfo = (value) => {
          addField(value, 'info')
     }

     /**
      * adds a warning appendix field
      * @param {string} value - the content of the appendix field
      */
     this.addWarning = (value) => {
          addField(value, 'warning')
     }
}

module.exports = Appendix;