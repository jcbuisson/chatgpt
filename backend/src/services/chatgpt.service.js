
import axios from 'axios'
import pdf from 'pdf-extraction'


export default function (app) {

   // dictionary associating the uuid for a pdf file and the arraybuffer of its contents
   const id2buffer = {}

   app.createService('chatgpt', {

      // add `chunk` to arraybuffer of pdf `id`
      uploadChunk: async (id, chunk) => {
         if (!id2buffer[id]) id2buffer[id] = Buffer.alloc(0)
         id2buffer[id] = Buffer.concat([id2buffer[id], Buffer.from(chunk)])
      },
      
      extractMeasures: async (id) => {
         const buffer = id2buffer[id]
         // parse buffer with `pdf-extraction`
         const pdfData = await pdf(buffer)
         // free arraybuffer
         delete id2buffer[id]
   
         // `pdfData.text` is the extracted text from pdf
         const prompt = `Extrait toutes les mesures de l'analyse de sang suivante, et renvoie uniquement une liste JSON composée d'objets comportant le nom (clé: 'name'), la valeur (clé: 'value'), l'unité (clé: 'unit') et la norme (clé: 'norm'), sans les annotations markdown : ${pdfData.text}`
         // const prompt = `Extrait les mesures de cholestérol et glycémie de l'analyse de sang suivante, et renvoie uniquement une liste JSON composée d'objets comportant le nom (clé: 'name'), la valeur (clé: 'value'), l'unité (clé: 'unit') et la norme (clé: 'norm'), sans les annotations markdown : ${pdfData.text}`
         // const prompt = `Extrait les mesures de l'analyse de foin suivante, et renvoie uniquement une liste JSON composée d'objets comportant le nom (clé: 'name'), la valeur (clé: 'value'), l'unité (clé: 'unit') et la norme (clé: 'norm'), sans les annotations markdown : ${pdfData.text}`
         const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
               { role: 'system', content: 'Vous êtes un assistant utile.' },
               { role: 'user', content: prompt }
            ],
            temperature: 0.7, // Contrôle de la créativité des réponses
            // max_tokens: 300 // Limite de mots dans la réponse
         }, {
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${process.env.CHATGPT_KEY}`
            }
         })
   
         const answer = response.data.choices[0].message.content
         const measures = JSON.parse(answer)
         return measures
      },
   })
}
