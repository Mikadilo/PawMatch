import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' })) // adapte selon ton front
app.use(bodyParser.json())

const DB_PATH = path.resolve('./server/bdd.json')

// Fonction helper pour lire la bdd
function readDB() {
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
}

// Fonction helper pour écrire dans la bdd
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

// Route login
app.post('/login', (req, res) => {
    const { email, password } = req.body
    const db = readDB()
    const user = db.users.find(u => u.email === email && u.password === password)
    if (!user) {
        return res.status(401).json({ message: 'Identifiants invalides' })
    }
    // Ne renvoie pas le password !
    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
})


app.get('/users', (req, res) => {
    const db = readDB()
    // Ne pas renvoyer les passwords pour la sécurité
    const usersWithoutPasswords = db.users.map(({ password, ...user }) => user)
    res.json(usersWithoutPasswords)
})


app.post('/users', (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' })
    }

    const db = readDB()

    // Vérifie que l'email n'est pas déjà pris
    const exists = db.users.some(u => u.email === email)
    if (exists) {
        return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' })
    }

    // Crée un nouvel ID (incrémentation simple)
    const newUser = {
        id: db.users.length ? db.users[db.users.length - 1].id + 1 : 1,
        username,
        email,
        password, // stocke en clair pour le moment, tu peux hasher si tu veux
    }

    db.users.push(newUser)
    writeDB(db)

    // Ne renvoie pas le password dans la réponse
    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json(userWithoutPassword)
})


// Exemple route pour récupérer les pets d’un utilisateur
app.get('/pets/:userId', (req, res) => {
    const db = readDB()
    const userId = Number(req.params.userId)
    const pets = db.pets.filter(p => p.ownerId === userId)
    res.json(pets)
})



app.get('/pets', (req, res) => {
    const db = readDB()
    res.json(db.pets)
})


// Exemple route pour ajouter un pet (POST avec body : { name, type, ownerId })
// Ajouter un animal
app.post('/pets', (req, res) => {
    const data = readDB()
    const { name, type, ownerId, age, photo } = req.body

    if (!name || !type || !ownerId) {
        return res.status(400).json({ message: 'Champs manquants : name, type et ownerId sont obligatoires' })
    }

    const userExists = data.users.some(u => u.id === ownerId)
    if (!userExists) {
        return res.status(400).json({ message: "Utilisateur propriétaire introuvable" })
    }

    const pet = {
        id: Date.now(),
        name,
        type,
        ownerId,
        age: age || null,
        photo: photo || null,
    }

    data.pets.push(pet)
    writeDB(data)

    res.status(201).json(pet)
})




// Retourne la liste des animaux likés PAR un utilisateur donné
app.get('/likes/:userId', (req, res) => {
    const db = readDB()
    const userId = Number(req.params.userId)

    // Tous les animaux où likedBy contient userId
    const likedPets = db.pets.filter(pet => (pet.likedBy || []).includes(userId))
    res.json(likedPets)
})

app.put('/users/:id', (req, res) => {
    const userId = Number(req.params.id);  // Convertir en nombre !
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
        return res.status(400).json({ error: 'Nom d’utilisateur invalide (min 3 caractères)' });
    }

    const data = readDB();  // Assure-toi que c’est bien la fonction pour lire la DB
    const user = data.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.username = username.trim();

    writeDB(data);  // Pareil, fonction d’écriture correcte

    res.json({ message: 'Nom mis à jour', user });
});



app.delete('/users/:id', (req, res) => {
    const userId = req.params.id
    const data = readData()

    const userIndex = data.users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    data.users.splice(userIndex, 1)

    // Supprimer animaux possédés
    data.pets = data.pets.filter(pet => pet.ownerId !== userId)

    // Supprimer likes faits
    data.likes = data.likes.filter(like => like.userId !== userId)

    // Supprimer likes sur animaux possédés
    const userPetsIds = data.pets.filter(p => p.ownerId === userId).map(p => p.id)
    data.likes = data.likes.filter(like => !userPetsIds.includes(like.petId))

    // Supprimer matchs liés
    data.matches = data.matches.filter(m => m.userId !== userId && m.matchedUserId !== userId)

    // Supprimer conversations de l’utilisateur
    data.conversations = data.conversations.filter(c => c.userId1 !== userId && c.userId2 !== userId)

    // Supprimer messages liés aux conversations supprimées
    const convIds = data.conversations.map(c => c.id)
    data.messages = data.messages.filter(msg => convIds.includes(msg.conversationId))

    writeData(data)

    res.json({ message: 'Utilisateur et données associées supprimés' })
})

app.get('/users/:id/stats', (req, res) => {
    const userId = Number(req.params.id);
    const data = readDB();

    const user = data.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const userPets = data.pets.filter(p => p.ownerId === userId);
    const petsCount = userPets.length;

    const likesReceivedCount = userPets.reduce((acc, pet) => acc + (pet.likedBy?.length || 0), 0);

    // Matches count basé sur la logique de likes réciproques
    const likedPets = data.pets.filter(pet => (pet.likedBy || []).includes(userId));
    const ownersOfLikedPets = likedPets.map(p => p.ownerId);
    const matches = data.pets.filter(pet => {
        if (!ownersOfLikedPets.includes(pet.ownerId)) return false;
        const likedBy = pet.likedBy || [];
        return userPets.some(upet => likedBy.includes(upet.ownerId));
    });
    const uniqueMatchedUserIds = [...new Set(matches.map(p => p.ownerId))];
    const matchesCount = uniqueMatchedUserIds.length;

    res.json({
        petsCount,
        likesReceivedCount,
        matchesCount
    });
});




// Crée ou récupère une conversation entre 2 utilisateurs
app.post('/conversations', (req, res) => {
    const { userId1, userId2 } = req.body
    if (!userId1 || !userId2) return res.status(400).json({ message: 'userId1 et userId2 requis' })

    const db = readDB()

    // S’assurer que db.conversations existe
    if (!Array.isArray(db.conversations)) {
        db.conversations = []
    }

    // Cherche une conversation existante entre ces 2 utilisateurs
    let conv = db.conversations.find(c => {
        const p = c.participants
        return (p.includes(userId1) && p.includes(userId2)) && p.length === 2
    })

    if (!conv) {
        // Crée une nouvelle conversation
        conv = {
            id: Date.now(),
            participants: [userId1, userId2],
            messages: []
        }
        db.conversations.push(conv)
        writeDB(db)
    }

    res.json(conv)
})


// Récupérer messages d'une conversation par id
app.get('/conversations/:id/messages', (req, res) => {
    const convId = Number(req.params.id)
    const db = readDB()
    const conv = db.conversations.find(c => c.id === convId)
    if (!conv) return res.status(404).json({ message: 'Conversation non trouvée' })
    res.json(conv.messages)
})

// Envoyer un message dans une conversation
app.post('/conversations/:id/messages', (req, res) => {
    const convId = Number(req.params.id)
    const { authorId, text } = req.body
    if (!authorId || !text) return res.status(400).json({ message: 'authorId et text requis' })

    const db = readDB()
    const conv = db.conversations.find(c => c.id === convId)
    if (!conv) return res.status(404).json({ message: 'Conversation non trouvée' })

    const message = {
        authorId,
        text,
        date: new Date().toISOString()
    }
    conv.messages.push(message)
    writeDB(db)
    res.json(message)
})


// Retourne la liste des matchs (animaux qui ont un like réciproque)
app.get('/matches/:userId', (req, res) => {
    const db = readDB()
    const userId = Number(req.params.userId)

    // Animaux likés par userId
    const likedPets = db.pets.filter(pet => (pet.likedBy || []).includes(userId))

    // Ids des propriétaires des animaux likés par userId
    const ownersOfLikedPets = likedPets.map(p => p.ownerId)

    // On récupère tous les animaux qui appartiennent à userId (les siens)
    const userPets = db.pets.filter(p => p.ownerId === userId)

    // On veut les animaux dont le propriétaire a été liké par userId
    // ET qui ont liké au moins un des animaux de userId (match réciproque)
    const matches = db.pets.filter(pet => {
        if (!ownersOfLikedPets.includes(pet.ownerId)) return false // propriétaire pas liké, pas match

        // Vérifie que pet appartient à un propriétaire parmi les ownersOfLikedPets
        // Et que cet animal a liké au moins un des pets de userId
        const likedBy = pet.likedBy || []
        // Est-ce que cet animal a liké un des animaux de userId ?
        return userPets.some(upet => likedBy.includes(upet.ownerId))
    })

    res.json(matches)
})

// Supprime un like de l'utilisateur sur un animal
app.delete('/like/:petId', (req, res) => {
    const petId = Number(req.params.petId)
    const { userId } = req.body
    if (!userId) return res.status(400).json({ message: 'userId est obligatoire dans le body' })

    const db = readDB()
    const pet = db.pets.find(p => p.id === petId)
    if (!pet) return res.status(404).json({ message: 'Animal non trouvé' })

    if (pet.likedBy) {
        pet.likedBy = pet.likedBy.filter(id => id !== userId)
        writeDB(db)
        return res.json({ message: 'Like supprimé avec succès' })
    }

    res.status(400).json({ message: 'Like non trouvé pour cet utilisateur' })
})



// Suppression d'un animal par id
app.delete('/pets/:id', (req, res) => {
    const petId = Number(req.params.id)
    const db = readDB()
    const petIndex = db.pets.findIndex(p => p.id === petId)
    if (petIndex === -1) {
        return res.status(404).json({ message: 'Animal non trouvé' })
    }

    db.pets.splice(petIndex, 1)
    writeDB(db)
    res.json({ message: 'Animal supprimé avec succès' })
})




// Route pour liker un animal
app.post('/like', (req, res) => {
    const { petId, userId } = req.body
    const db = readDB()

    const pet = db.pets.find(p => p.id === petId)
    if (!pet) {
        return res.status(404).json({ message: 'Animal à liker non trouvé' })
    }

    // Initialise likedBy s'il n'existe pas
    if (!pet.likedBy) {
        pet.likedBy = []
    }

    // Évite les doublons
    if (!pet.likedBy.includes(userId)) {
        pet.likedBy.push(userId)
    }

    writeDB(db)

    // 🔁 Détection d’un match
    const petOwnerId = pet.ownerId

    const petsOfLiker = db.pets.filter(p => p.ownerId === userId)
    const likedBack = petsOfLiker.find(p =>
        (p.likedBy || []).includes(petOwnerId)
    )

    if (likedBack) {
        return res.json({ match: true, message: '🎉 C’est un match !' })
    }

    res.json({ match: false, message: 'Animal liké avec succès' })
})



app.listen(3000, () => {
    console.log('API démarrée sur http://localhost:3000')
})
