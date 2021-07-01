<template>
  <div id="app">
    <!--In v-card is the view for the filteroptions-->
    <v-card
      width="600px"
      class="mx-auto mt-5"
      elevation="1"
      outlined
      id="search"
      v-if="user.role == 'Teacher'"
    >
      <v-menu
        ref="menu1"
        v-model="menuSearch"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            class="ml-15 mr-15"
            v-model="dateRangeText"
            label="Datum (von / bis)"
            readonly
            v-bind="attrs"
            v-on="on"
            clearable
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="searchJournal.date"
          range
          no-title
          @input="menuSearch = false"
        ></v-date-picker>
      </v-menu>
      <v-text-field
        clearable
        label="Username"
        class="ml-15 mr-15"
        v-model="searchJournal.sAMAccountName"
        hide-details
        single-line
      ></v-text-field>
      <br />
      <v-select
        class="ml-15 mr-15"
        clearable
        v-model="searchJournal.subject"
        :items="subjectArray"
        item-text="description"
        label="Fach"
      ></v-select>
      <v-btn @click="getJournal()">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <br />
      <br />
    </v-card>
    <!--It will render this tag everytime a journal is created-->
    <v-main id="main" v-for="(journal, idx) in journalArray" :key="idx">
      <!--This dialog is for updating the journal-->
      <v-dialog
        :retain-focus="false"
        v-model="dialogUpdate"
        persistent
        max-width="700px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-col>
            <!--If this button is clicked, it will send the chosen journal to the method "getJournalId"-->
            <v-btn
              @click="getJournalId(journal)"
              class="mx-2"
              dark
              small
              color="cyan"
              v-bind="attrs"
              v-on="on"
              v-if="
                journalArray[idx].comments.length === 0 &&
                user.role == 'Student'
              "
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <!--If the followed button is clicked, the chosen journal will be deleted-->
            <v-btn
              @click="deleteJournal(journal.journal_id)"
              class="mx-2"
              dark
              small
              color="red"
              v-if="
                journalArray[idx].comments.length === 0 &&
                user.role == 'Student'
              "
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <!-- <v-btn
              @click="downloadPDF(journal)"
              class="mx-2"
              small
              style="float: right"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn> -->

            <br />
          </v-col>
        </template>

        <v-card>
          <v-card-title>Bearbeiten</v-card-title>

          <v-container>
            <v-menu
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="updatedJournal.date"
                  label="Datum"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="updatedJournal.date"
                @input="menu = false"
              ></v-date-picker>
            </v-menu>

            <v-textarea
              v-model="updatedJournal.text"
              append-icon="mdi-pencil"
              label="Text"
            ></v-textarea>
            <v-select
              v-model="updatedJournal.subject"
              :items="subjectArray"
              item-text="description"
              label="Fach"
            ></v-select>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" @click="dialogUpdate = false" text>
              Schliessen
            </v-btn>
            <!--For clicking this button, it will update the journal-->
            <v-btn color="blue darken-1" @click="updateJournal()" text>
              Speichern
            </v-btn>
          </v-card-actions>
          <!--The followed tag is a error warning-->
          <p style="color: red; text-align: center" v-if="showError" id="error">
            Bitte füllen Sie alle Felder aus!
          </p>
        </v-card>
      </v-dialog>

      <v-card>
        <v-simple-table id="table">
          <!--Here is the table. This table will show you the content of the journals-->
          <template v-slot:default>
            <thead>
              <tr>
                <th colspan="3">
                  Arbeitsjournal von {{ journal.sAMAccountName }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th rowspan="3">Eintrag</th>
                <th>Datum</th>
                <td>{{ journal.date | formatDate }}</td>
              </tr>
              <tr id="journaltextpdf" cols="4">
                <th>Text</th>
                <td>{{journal.text }}</td>
              </tr>
              <tr>
                <th>Fach</th>
                <td>{{ journal.description }}</td>
              </tr>
              <!--The followed tag will be rendered everytime a comment is created-->
              <tr v-for="(comment, idx) in journal.comments" :key="idx">
                <th :rowspan="journal.comments.length" v-if="idx == 0">
                  Kommentare
                </th>
                <th>Kommentar {{ idx + 1 }}: {{ comment.sAMAccountName }}</th>
                <td>{{ comment.comment }}</td>
                <th>{{ comment.date | formatDate }}</th>
                <!--This is a Dialog for update a comment-->
                <v-dialog
                  :retain-focus="false"
                  v-model="dialogUpdateComment"
                  persistent
                  max-width="600px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-col id="search">
                      <v-btn
                        style="pointer-events: auto"
                        small
                        class="mr-2"
                        dark
                        color="cyan"
                        v-bind="attrs"
                        v-on="on"
                        @click="getComment(comment)"
                        v-if="
                          user.role == 'Teacher' &&
                          comment.sAMAccountName == user.username
                        "
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </v-col>
                  </template>

                  <v-card>
                    <v-card-title>Kommentar bearbeiten</v-card-title>

                    <v-container>
                      <v-textarea
                        v-model="updatedComment.comment"
                        append-icon="mdi-pencil"
                        label="Text"
                      ></v-textarea>
                    </v-container>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue darken-1"
                        @click="dialogUpdateComment = false"
                        text
                      >
                        Schliessen
                      </v-btn>
                      <!--When this button is clicked, it will update the comment-->
                      <v-btn
                        color="blue darken-1"
                        @click="updateComment()"
                        text
                      >
                        Speichern
                      </v-btn>
                    </v-card-actions>
                    <!--The followed tag is a error warning-->
                    <p
                      style="color: red; text-align: center"
                      v-if="showErrorCommentUpdate"
                      id="error"
                    >
                      Bitte füllen Sie alle Felder aus!
                    </p>
                  </v-card>
                </v-dialog>
              </tr>

              <tr v-if="user.role == 'Teacher'">
                <!--This dialog is for creating a comment-->
                <v-dialog
                  :retain-focus="false"
                  v-model="dialogComment"
                  persistent
                  max-width="600px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-col id="search">
                      <v-btn
                        @click="setFK_journal(journal.journal_id)"
                        style="pointer-events: auto"
                        v-bind="attrs"
                        v-on="on"
                      >
                        Kommentieren
                      </v-btn>
                    </v-col>
                  </template>

                  <v-card>
                    <v-card-title>Kommentar</v-card-title>

                    <v-container>
                      <v-textarea
                        v-model="commentData.comment"
                        append-icon="mdi-pencil"
                        label="Text"
                      ></v-textarea>
                    </v-container>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue darken-1" @click="clearComment()" text>
                        Schliessen
                      </v-btn>
                      <!--When this button is clicked, it will create a comment-->
                      <v-btn color="blue darken-1" @click="sendComment()" text>
                        Speichern
                      </v-btn>
                    </v-card-actions>
                    <!--The followed tag is a error warning-->
                    <p
                      style="color: red; text-align: center"
                      v-if="showErrorComment"
                      id="error"
                    >
                      Bitte füllen Sie alle Felder aus!
                    </p>
                  </v-card>
                </v-dialog>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
      <br /><br /><br />
    </v-main>
  </div>
</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";
export default {
  props: {
    user: Object,
  },

  data() {
    return {
      journalArray: [],
      subjectArray: [],
      dialogUpdateComment: false,
      dialogComment: false,
      dialogUpdate: false,
      showError: false,
      showErrorComment: false,
      showErrorCommentUpdate: false,
      journalButton: true,
      menu: false,
      menuSearch: false,
      searchJournal: {
        sAMAccountName: "",
        date: [],
        subject: "",
        role: "",
        username: "",
      },
      commentData: {
        comment: "",
        fk_journal: "",
        sAMAccountName: "",
      },
      commentArray: [],
      updatedJournal: {
        journal_id: "",
        date: new Date().toISOString().substr(0, 10),
        text: "",
        subject: "",
      },
      updatedComment: {
        comment: "",
        comment_id: "",
      },
    };
  },

  computed: {
    dateRangeText() {
      return this.searchJournal.date.join(" - ");
    },
  },

  created() {
    //Created will be executed everytime the Website is loaded
    this.getJournal();
    this.getSubject();
  },

  methods: {
    downloadPDF(journal) {
      let pdf = new jsPDF();

      /* let date = this.formatDate(journal.date);

      let splitTitle = pdf.splitTextToSize(journal.text, 250)

      let line = 30
      let lineHeight = 10
      let leftMargin = 10
      pdf.setFontSize(10)

      console.log(splitTitle.length);

      for (var i = 0, length = splitTitle.length; i < length; i++) {
        pdf.text("Text: " + splitTitle[i], leftMargin, line)
        line = lineHeight + line
      }

      if (journal.comments.length == 0) {
        pdf.text("Datum: " + date, 10, 10);
        pdf.text("Fach: " + journal.description, 10, line+10);
        pdf.save('journal.pdf') 

      } else {
        let a = 50
        for (let comments of journal.comments) {
          a = a+20
          pdf.text("Kommentar " + comments.sAMAccountName + ": " + comments.comment, 10, a);
        }
        pdf.text("Datum: " + date, 10, 10);
        pdf.text("Text: " + journal.text, 10, 30);
        pdf.text("Fach: " + journal.description, 10, 50);
        pdf.save("journal.pdf")
      } */
    },

    async getSubject() {
      //Gets table subject for the dropdown
      await axios.get("/api/subject").then((response) => {
        this.subjectArray = response.data;
      });
    },

    async getJournal() {
      //Gets journal for user and sends filterdata if the user is teacher
      this.searchJournal.role = this.user.role;
      this.searchJournal.username = this.user.username;
      await axios.post("/api/journal", this.searchJournal).then((response) => {
        this.journalArray = response.data;
        this.searchJournal.date = [];
        this.searchJournal.sAMAccountName = "";
        this.searchJournal.subject = "";
      });
    },

    async updateJournal() {
      //This method will be execudet if a journal is updated
      if (this.updatedJournal.date == "") {
        //Are all of the inputs empty?
        this.showError = true; //If yes. Show error message.
      } else if (this.updatedJournal.text == "") {
        this.showError = true;
      } else if (this.updatedJournal.subject == "") {
        this.showError = true;
      } else {
        await axios
          .put("/api/journal/update", this.updatedJournal)
          .then((response) => {
            this.dialogUpdate = false;
            this.showError = false;
            this.getJournal();
          });
      }
    },

    async deleteJournal(journalId) {
      //With this method, the journal is gonna be deleted
      var deleteId = journalId;
      await axios
        .post("/api/journal/delete", { toDelete: deleteId })
        .then((response) => {
          this.getJournal();
        });
    },

    async sendComment() {
      //This method creates a comment
      if (this.commentData.comment == "") {
        //Is the input empty?
        this.showErrorComment = true; //When the answer is yes. Show error message
      } else {
        //When the answer is no, should it send the comment datas to the backend
        this.commentData.sAMAccountName = this.user.username;
        await axios.post("/api/comment", this.commentData).then((response) => {
          this.commentData.comment = null;
          this.getJournal();
          this.dialogComment = false;
          this.showErrorComment = false;
        });
      }
    },

    setFK_journal(journalId) {
      //gets journal id for the foreign key in table comment
      this.showErrorComment = false;
      this.commentData.fk_journal = journalId;
    },

    getComment(comment) {
      //Gets comment for updating a comment
      this.showErrorCommentUpdate = false;
      this.updatedComment.comment = comment.comment;
      this.updatedComment.comment_id = comment.comment_id;
    },

    async updateComment() {
      //Updates a comment that already existed
      if (this.updatedComment.comment == "") {
        //Is the input empty?
        this.showErrorCommentUpdate = true; //When the answer is yes. Show error message
      } else {
        //Send updated comment to the backend
        await axios
          .put("api/comment/update", this.updatedComment)
          .then((response) => {
            this.getJournal();
            this.dialogUpdateComment = false;
            this.showErrorCommentUpdate = false;
          });
      }
    },

    clearComment() {
      //Clears the input of a comment dialog
      this.dialogComment = false;
      this.commentData = {};
    },

    getJournalId(journalId) {
      //Gets journal for updating a journal
      this.updatedJournal.date = this.formatDate(journalId.date);
      this.updatedJournal.text = journalId.text;
      this.updatedJournal.subject = journalId.description;
      this.updatedJournal.journal_id = journalId.journal_id;
    },

    formatDate(date) {
      //This method is for formating a date
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    },
  },
};
</script>


<style>
.ql-editor {
  height: 50vh;
}

#search {
  text-align: center;
}

#table th {
  width: 15%;
  table-layout: fixed;
}

#table {
  pointer-events: none;
}
</style>