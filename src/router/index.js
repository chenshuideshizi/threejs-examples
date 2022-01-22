import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'index',
            component: (resolve) => require(['@/pages/index'], resolve)
        },
        {
            path: '/jump',
            name: 'jump',
            component: (resolve) => require(['@/pages/jump'], resolve)
        },
        {
            path: '/mini-city',
            name: 'mini-city',
            component: (resolve) => require(['@/pages/mini-city'], resolve)
        }
    ]
})
