
import axios from 'axios'
import pdf from 'pdf-extraction'


export default function (app) {

   const id2buffer = {}

   app.createService('chatgpt', {

      uploadChunk: async (id, chunk) => {
         console.log('chunk')
         if (!id2buffer[id]) id2buffer[id] = Buffer.alloc(0)
         id2buffer[id] = Buffer.concat([id2buffer[id], Buffer.from(chunk)])
      },
      
      extractMeasures: async (id) => {
         // const filePath = '/Users/chris/Downloads/analyses2024-06.pdf'
         // const filePath = '/Users/chris/Downloads/analyse_foin.pdf'
         // const buffer = fs.readFileSync(filePath)
         const buffer = id2buffer[id]
         const pdfData = await pdf(buffer)
         console.log('Extracted Text:', pdfData.text)
   
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
         console.log('answer', answer)
         const measures = JSON.parse(answer)
         console.log('measures', measures)

         return measures
      },
   })
}
