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

// My module
function Appendix() {
     this.content = '\n'

     this.addError = (value) => {
          this.content = `${this.content}\n${AppendixTypes.error.icon} ${value}`
     }
}

/* Appendix.prototype.foo = function foo() {
     console.log(this.bar);
}; */

module.exports = Appendix;