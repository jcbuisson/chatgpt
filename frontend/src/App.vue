<template>
   <h1>API de ChatGPT</h1>
   <h2>Extraction de données d'un PDF</h2>

   <jcb-upload class="dropzone" chunksize="32768" accept="application/pdf"
         @upload-start="onUploadStart" @upload-chunk="onUploadChunk" @upload-end="onUploadEnd">
      <p>glissez-déposez ou cliquez ici pour charger une analyse de sang au format PDF... (<a href="/static/analyses2024-06.pdf" target="_blank">exemple</a>)</p>
   </jcb-upload>

   <div class="message">{{ message }}</div>

   <template v-if="measures?.length">
      <div class="table-container">
         <table>
            <thead>
               <tr>
                     <th>Test</th>
                     <th>Valeur</th>
                     <th>Unité</th>
                     <th>Norme</th>
               </tr>
            </thead>
            <tbody>
               <template v-for="measure of measures">
                  <tr>
                     <td>{{ measure.name }}</td>
                     <td>{{ measure.value }}</td>
                     <td>{{ measure.unit }}</td>
                     <td>{{ measure.norm }}</td>
                  </tr>
               </template>
            </tbody>
         </table>
      </div>
   </template>

   <jcb-spinner ref="spinner">
      <p class="spinner-text">Extraction des valeurs par ChatGPT...</p>
   </jcb-spinner>

</template>


<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

import 'jcb-spinner'
import 'jcb-upload'

const spinner = ref(null)

const message = ref('')
const measures = ref([])

const id = ref()

import { app } from '/src/client-app.js'


async function onUploadStart() {
   console.log('onUploadStart')
   showSpinner()
}

async function onUploadChunk(e) {
   console.log('onUploadChunk', e)
   if (!id.value) id.value = uuidv4()
   await app.service('chatgpt').uploadChunk(id.value, e.detail.arrayBufferSlice)
}

async function onUploadEnd() {
   console.log('onUploadEnd')
   try {
      measures.value = await app.service('chatgpt', { timeout: 60000 }).extractMeasures(id.value)
      id.value = undefined
      message.value = ''
   } catch(err) {
      message.value = '' + err
   } finally {
      hideSpinner()
   }
}

function showSpinner() {
   spinner.value.visible = true
}

function hideSpinner() {
   spinner.value.visible = false
}
</script>


<style scoped>
.dropzone {
   margin-bottom: 20px;
   width: 600px;
}

#message {
   margin-top: 20px;
   color: green;
}

h2 {
   color: #999;
}



.table-container {
   max-width: 800px;
   margin: 0 auto;
   background: white;
   border-radius: 8px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
   overflow: hidden;
}

table {
   width: 100%;
   border-collapse: collapse;
}

th, td {
   text-align: left;
   padding: 12px;
   border-bottom: 1px solid #ddd;
}

thead th {
   background-color: #f7f7f7;
   font-weight: bold;
}

th[colspan="4"] {
   background-color: #e9ecef;
   font-weight: bold;
   text-align: left;
}

.low {
   color: #e63946;
   font-weight: bold;
}

.high {
   color: #ff7f0e;
   font-weight: bold;
}

jcb-spinner {
   --jcb-spinner-size: 300px;
   --jcb-spinner-background-opacity: 0.6;
}

.spinner-text {
   color: white;
   font-weight: 300;
   font-size: 18px;
}
</style>
