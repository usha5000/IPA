<template>
  <div id="app">
    <!--This whole view is only for a student visible-->
    <v-app v-if="user.role == 'Student'">
      <v-card width="600px" class="mx-auto mt-5" elevation="12" outlined>
        <v-card-text>
          <v-dialog ref="dialog" v-model="modal" :return-value.sync="journalData.date" persistent width="290px"> <!--This dialog is calendar for choosing a date-->
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="journalData.date" label="Datum" readonly v-bind="attrs" v-on="on" append-icon="mdi-calendar">
              </v-text-field>
            </template>
            <v-date-picker v-model="journalData.date" scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="modal = false">
                Schliessen
              </v-btn>
              <v-btn text color="primary" @click="$refs.dialog.save(journalData.date)">
                OK
              </v-btn>
            </v-date-picker>
          </v-dialog>
          <v-textarea maxlength="500" counter v-model="journalData.text" label="Text">
          </v-textarea>
          <v-select v-model="journalData.subject" :items="subjectArray" item-text="description" label="Fach"></v-select>
          <v-col class="text-right">
            <v-btn @click="sendJournalData()">Speichern</v-btn>
          </v-col>
        </v-card-text> <!--The followed tag is a error message-->
        <p style="color: red; text-align: center" v-if="showError" id="error">
          Bitte füllen Sie alle Felder aus!
        </p>
      </v-card>
    </v-app>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    user: Object,
  },

  name: "App",

  components: {},

  data() {
    return {
      journalData: {
        date: new Date().toISOString().substr(0, 10),
        text: "",
        sAMAccountName: "",
        subject: "",
      },
      modal: false,
      subjectArray: [],
      showError: false,
    };
  },

  created() {
    this.getSubject();
  },

  methods: {
    async getSubject() { //Gets subjects from table subject for the dropdown
      await axios.get("/api/subject").then((response) => {
        this.subjectArray = response.data;
      });
    },

    async sendJournalData() { //The journal will be sent with this method
      if (this.journalData.date == "") { //is one of the inputfields empty?
        this.showError = true; //If yes. Show error message
      } else if (this.journalData.text == "") {
        this.showError = true;
      } else if (this.journalData.subject == "") {
        this.showError = true;
      } else { //Sends journal data to the backend
        this.journalData.sAMAccountName = this.user.username;
        await axios.post("/api/create", this.journalData).then((response) => {
          this.$router.push("/ansicht");
          this.journalData = {};
          this.showError = false;
        })
       
      }
    },
  },
};
</script>

<style>
</style>
