import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import axios from 'axios'
import pdf from 'pdf-extraction'
import fs from 'fs'

const app = express()

// Configure Multer for file storage
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, './uploads') // Directory for uploads
   },
   filename: (req, file, cb) => {
      cb(null, file.originalname)
   }
})

const upload = multer({
   storage,
   fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
         cb(null, true) // Accept PDF files only
      } else {
         cb(new Error('Only PDF files are allowed!'))
      }
   }
})

// Middleware
app.set('view engine', 'ejs')

app.use(express.static('public')) // Serve static files
app.use('/uploads', express.static('uploads'))

// Routes
app.get('/', (req, res) => {
   res.render('index') // Render the EJS file
})

Promise.withResolvers = function () {
   let resolve, reject;
   const promise = new Promise((res, rej) => {
       resolve = res;
       reject = rej;
   });
   return { promise, resolve, reject };
}

app.post('/upload', upload.single('file'), async (req, res) => {
   if (req.file) {
      // file uploaded successfully
      const filePath = `/Users/chris/workspaces/PORTFOLIO/chatgpt/uploads/${req.file.filename}`
      const buffer = fs.readFileSync(filePath)
      const data = await pdf(buffer)
      console.log('Extracted Text:', data.text)

      try {
         const prompt = `Extrait les valeurs de cholestérol et glycémie de l'analyse de sang suivante, et renvoie uniquement une structure JSON avec le nom (clé: 'name'), la valeur (clé: 'value'), l'unité (clé: 'key') et la norme (clé: 'norm'), sans les annotations markdown : ${data.text}`
         // const prompt = `Donne-moi un proverbe au hasard`
         const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
               { role: 'system', content: 'Vous êtes un assistant utile.' },
               { role: 'user', content: prompt }
            ],
            temperature: 0.7, // Contrôle de la créativité des réponses
            max_tokens: 300 // Limite de mots dans la réponse
         }, {
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${process.env.CHATGPT_KEY}`
            }
         })
 
         console.log('Réponse:', response.data.choices[0].message.content)
         // console.log('Réponse:', response)

         // const data = JSON.parse(response.data.choices[0].message.content)
         // const data = {}

         res.send("OK")
      } catch (error) {
         return res.status(500).send(error.message)
      }

   } else {
      return res.status(400).send("Aucun fichier fourni")
   }
})

// Error handling
app.use((err, req, res, next) => {
   if (err) {
      res.status(400).send(err.message)
   } else {
      next()
   }
})

// Start server
app.listen(3000, () => {
   console.log('Server running at http://localhost:3000')
})
