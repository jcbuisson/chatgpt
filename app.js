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
   res.render('index', {
      data: [],
   })
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
      // const filePath = `/Users/chris/workspaces/PORTFOLIO/chatgpt/uploads/${req.file.filename}`
      // const buffer = fs.readFileSync(filePath)
      const buffer = fs.readFileSync(req.file.path)
      const pdfData = await pdf(buffer)
      console.log('Extracted Text:', pdfData.text)

      try {
         const prompt = `Extrait toutes les mesures de l'analyse de sang suivante, et renvoie uniquement une liste JSON composée d'objets comportant le nom (clé: 'name'), la valeur (clé: 'value'), l'unité (clé: 'unit') et la norme (clé: 'norm'), sans les annotations markdown : ${pdfData.text}`
         // const prompt = `Extrait les mesures de cholestérol et glycémie de l'analyse de sang suivante, et renvoie uniquement une liste JSON composée d'objets comportant le nom (clé: 'name'), la valeur (clé: 'value'), l'unité (clé: 'unit') et la norme (clé: 'norm'), sans les annotations markdown : ${pdfData.text}`
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
         const data = JSON.parse(answer)
         console.log('data', data)

         res.render("index", { data })
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
