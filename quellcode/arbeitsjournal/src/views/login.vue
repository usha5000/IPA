<template>

    <v-app>
    <v-card width="400px" class="mx-auto mt-5">
        <v-card-title class="pb-0">
            <h1>Login</h1>
        </v-card-title>
        <br>
        <v-card-text>
            <v-form>
                <v-text-field name="Username" label="Username" v-model="loginData.username"></v-text-field>
                <v-text-field name="Password" label="Password" type="password" v-model="loginData.password"></v-text-field>
            </v-form>
            </v-card-text>
            <v-divider></v-divider> 
            <v-card-actions>
                <v-btn type="submit" primary large block @click="login()">Login</v-btn>
            </v-card-actions>
            <p style="color:red; text-align:center;" v-if="showError" id="error">Logindaten inkorrekt!</p>
    </v-card>
    </v-app>
    
</template>

<script>
import axios from "axios";

export default {
  name: 'App',

 props: {
    link: {
      type: Boolean
    },
    logoutButton: {
      type: Boolean
    },
    user: Object
  },

  components: {},

  data() {
    return {
      loginData:{
        username: '',
        password: '',
      },
      showError: false,
      
      
    }
  },
  methods: {
    login() {
        axios.post('/api/user/login', this.loginData)
          .then(response => {
            let data = response.data
            if (data.token) {
             localStorage.setItem('token', data.token)
             this.$emit('setUser', true)
            } else {
              this.showError = true
            }
      })
    }
  }

};
</script>

<style>


</style>

