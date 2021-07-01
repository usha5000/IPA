//Imports all the view-files to configure them for routing
import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../views/login'
import erstellen from '../views/erstellen'
import ansicht from '../views/ansicht'

Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
    base: process.env.Base_URL,
    routes: [
{   //Creates a path for a view 
    path: '/erstellen',
    name: 'erstellen',
    component: erstellen,
    
},

{    
    path: '/ansicht',
    name: 'ansicht',
    component: ansicht,
    
},

{
    path: '/login',
    name: 'login',
    component: login,

}

]
});
export default router; 