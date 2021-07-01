<template>
  <div id="app">
    <v-app>
      <div id="header"> <!--Here is the header of the website. It shows you the tfbern logo, the logout button and the update username button-->
        <img src="http://www.tfbern.ch/TF/media/gfx/logo.png" />
        <!--For clicking this button, it will log the user out-->
        <v-btn
          @click="logout()"
          type="button"
          id="button"
          style="position: absolute; right: 0"
          fab
          class="mx-2"
          v-if="logoutButton"
          color="teal"
          ><v-icon color="white">mdi-logout</v-icon>
        </v-btn>
        <!--This dialog is for updating a username in the database, only teachers can see this button and dialog-->
        <v-dialog
          v-if="user.role == 'Teacher'"
          v-model="dialogSam"
          persistent
          max-width="600px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click="setError()"
              v-bind="attrs"
              v-on="on"
              style="position: absolute; right: 0"
              color="grey"
              id="updateSam"
              fab
            >
              <v-icon color="white">mdi-cog</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-card-title>update sAMAccountName</v-card-title>

            <v-container>
              <v-select clearable v-model="updatedUsername.role" :items="roleArray" label="Rolle"></v-select>
              <v-text-field v-model="updatedUsername.oldUsername" label="alter sAMAccountName"></v-text-field>
              <v-text-field v-model="updatedUsername.newUsername" label="neuer sAMAccountName"></v-text-field>
            </v-container>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" @click="dialogSam = false" text>
                Schliessen
              </v-btn>
              <!--If this button is triggered, it will update the username in the database-->
              <v-btn color="blue darken-1" @click="updateUsername()" text>
                Speichern
              </v-btn>
            </v-card-actions>
              <!--The followed tag is a error message-->
             <p style="color:red; text-align:center;" v-if="showError" id="error">Füllen Sie alle Felder aus!</p>
          </v-card>
        </v-dialog>
      </div>

      <!--The router is for navigating in the views-->
      <div id="nav" v-if="user.role == 'Student'">
        <router-link to="/erstellen">
          <v-btn>erstellen</v-btn>
        </router-link>
        <router-link to="/ansicht">
          <v-btn>Ansicht</v-btn>
        </router-link>
      </div>

      <v-main>
        <v-container> <!--Sends the object "user" to the other files as props-->
          <router-view :user="user" @setUser="setUser($event)" /> <!--If someone is logged in, it will execute the method "setUser"-->
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import axios from "axios"
export default {
  name: "App",

  components: {},

  data() {
    return {
      roleArray: ["Lehrer", "Schüler"],
      dialogSam: false,
      logoutButton: true,
      user: {},
      showError: false,
      updatedUsername: {
        role: '',
        oldUsername: '',
        newUsername: '',
      },
    };
  },

  created() {
    if (localStorage.token != undefined) {
      //If there is a token, a object will be created with a decoded token
      let payload = this.decodeToken(localStorage.token);
      if (payload.exp > Math.floor(Date.now() / 1000)) {
        this.user = payload
      }
      else {
        localStorage.removeItem("token")
        this.$router.push("/login")
        this.logoutButton = false
      }
      console.log("logged in as: ", this.user.username);
    } else {
      //If there isn't a token, you will be redirectet to the loginpage
      this.$router.push("/login");
      this.logoutButton = false;
    }
  },

  methods: {
    logout() {
      //Token will be removed. You will be redirectet to the loginpage
      localStorage.removeItem("token");
      this.$router.push("/login");
      this.user.role = "";
      this.logoutButton = false;
    },

    setError() {
      this.showError = false
    },

    setUser(updatedButtons) {
      //A object will be created with the decoded Token. With this object, the authorization concept can be created. The Role is a Part of a Token
      this.user = this.decodeToken(localStorage.token);
      console.log("logged in as:", this.user.username);
      if (this.user.role == "Teacher") {
      this.$router.push("/ansicht");
      } else {
        this.$router.push("erstellen");
      }
      this.logoutButton = updatedButtons
    },

    async updateUsername() {
      //For the case, that the username will be updatet in Active Directory, there is a function to update the username in the database too
      if (this.updatedUsername.role == '') { //Is one of the Inputfields empty?
        this.showError = true //If yes. Show error message
      }
      else if (this.updatedUsername.oldUsername == '') {
        this.showError = true
      }

      else if (this.updatedUsername.newUsername == '') {
        this.showError = true
      }
      else { //Send data for updated username to the backend
      await axios.put('/api/username/update', this.updatedUsername).then(response => {
        this.dialogSam = false
        this.showError = false
      })
      }
    },

    decodeToken(token) {
      //Token has to be decoded to create a authorization concept
      let payload = token.replace(/-/g, "+").replace(/_/g, "/").split(".")[1];
      payload = JSON.parse(Buffer.from(payload, "base64").toString());
      return payload;
    },
  },
};
</script>

<style>
#header {
  width: 100%;
  box-shadow: 0px 0px 3px gray;
  height: 75px;
  background-color: white;
  display: inline-flex;
}

#header img {
  height: calc(100% - 20px);
  float: right;

  margin: 10px;
  padding-left: 5px;
}

#nav {
  margin-bottom: 20px;
  margin-top: 20px;
  text-align: center;
}
#nav a {
  font-weight: bold;
  color: white;
}

#button {
  height: 50px;
  margin-top: 12px;
}

#updateSam {
  margin-right: 100px;
  margin-top: 12px;
  height: 50px;
}

#app {
  font-family: Arial, Helvetica, sans-serif;
}
</style>