import express from 'express';
import cors from 'cors';
import multer from "multer";
import * as database from './database.js';
import fs from 'fs';
import dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.MY_KEY, 
  api_secret: process.env.MY_SECRET
});

dotenv.config()

const app = express();
const PORT = 3030;

const upload = multer({dest: 'project-collection'});

app.use(cors());
app.use(express.json());

app.post('/upload', upload.single('file'), async (req, res) => {
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path)
      const imageUrl = result.secure_url
      res.json({message: imageUrl})
    } catch (e) {
      console.log(e)
      res.status(500).json({ error: 'failed to upload' });
    } finally {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.log(err)
          } else {
            console.log('file deleted')
          }
        });
      }
  } 
})

app.get('/items', async (req, res) => {
  const items = await database.getItems();
  res.send(items);
})

app.post('/like', async (req, res) => {
  const idUser = req.body.idU;
  const idColl = req.body.idC;
  const like = req.body.like;
  if (like) {
    await database.makeLike(idUser, idColl)
    await database.addLike(idColl)
    const updateColl = await database.getCollections();
    res.json({updateColl})
  } 
  else {
    const likeId = await database.getLike(idUser, idColl);
    await database.deleteLike(likeId[0].id)
    await database.deleteLikeColl(idColl);

    const updateColl = await database.getCollections();
    res.json({updateColl})
  }
  res.end();
})

app.get('/collections', async (req, res) => {
  const collections = await database.getCollections();
  const likes = await database.getLikes();
  const last = await database.lastFiveItems();
  const largest = await database.getLargestCollections();
  res.json({collections, likes, last, largest});
})

app.post('/myCollections', async (req, res) => {
  const idUser = req.body.userId
  const getMy = await database.getMyCollections(idUser);
  res.json({ getMy });
})

app.post('/login', async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  const isCorrectData = await database.isCorrectDataUser(login, password);
  if (isCorrectData) {
    const user = await database.getUser(login, password);
    const userId = user[0].id;
    const isBlock = await database.isBlock(userId, 'blocked');
    if (isBlock.length > 0) {
      res.json({message: 'blocked'})
    } else {
      const admin = await database.isAdmin(login, password);
      return res.json({isAdmin: admin, userId: userId});
    }
  } else {
      return res.json({message: "data is't correct"});
  }
})

app.post('/registration', async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  const name = req.body.name;
  const status = 'active'
  const isAlreadyExist = await database.isAlreadyExistUser(login);
  if (isAlreadyExist) {
    res.json({ message: 'exist'} );
  } else {
    await database.createUser(login, password, false, name, status);
  const user = await database.getUser(login, password);
  const userId = user[0].id;
    res.json({ message: 'notExist', id: userId} );
  }
  res.end()
});

app.post('/deleteColl', async (req, res) => {
  const { id } = req.body
  await database.deleteCollection(id);
  const updateColl = await database.getCollections();
  await database.deleteItems(id);
  res.json({message: 'ok', updateColl});
  
})

app.post('/createcoll', async (req, res) => {
  const id = req.body.data.userId;
  const name = req.body.data.name;
  const descr = req.body.data.description;
  const category = req.body.data.category;
  const inputs = req.body.inputs;
  const linkToImg = req.body.data.lin;
  const idColl = await database.createCollection(name, descr, category, id, inputs[0], inputs[1], inputs[2], linkToImg);
  res.json({message: 'ok'})
})

app.post('/addItem', async (req, res) => {
  const name = req.body.nameItem;
  const id = req.body.idC;
  const tag = req.body.tag;
  const valueField = req.body.valueField;
  const userId = req.body.userId;
  const user = await database.getUserById(userId)
  const login = user[0].login
  const values = Object.values(valueField);
  const tagText = tag.map((el) => el.text);
  const tags = tagText.map((el) => el.startsWith('#') ? el : `#${el}`);
  await database.addItem(name, tags.join(' '), id, values[0], values[1], values[2], login);
  await database.countItem(id);
  res.json({message: 'ok'});
})

app.post('/getcollection', async (req, res) => {
  const idCollection = req.body.idColl;
  const items = await database.getItems(idCollection);
  const collection = await database.getCollection(idCollection);
  res.json({items, collection});
})

app.post('/deleteItem', async (req, res) => {
  const idItem = req.body.id;
  const idColl = req.body.idC;
  await database.deleteItem(idItem);
  await database.deleteItemCount(idColl)
  const update = await database.getItems(idColl)
  res.json({message: 'ok', items: update});
})

app.get('/admin', async (req, res) => {
  const users = await database.getUsers();
  res.json({users: users})
})

app.post('/deleteUsers', async (req, res) => {
  const id = req.body.selected;
  await database.deleteUser(id);
  const updateUsers = await database.getUsers();
  res.json({ new: updateUsers})
})

app.post('/makeAdmin', async (req, res) => {
  const id = req.body.id;
  const status = req.body.status
  await database.makeAdminMakeUser(status, id);
  const update = await database.getUsers();
  res.json({ update })
})

app.post('/block', async (req, res) => {
  const newStatus = req.body.newStatus;
  const idUser = req.body.selected;
  if (newStatus === 'block') {
    await database.changeStatus(idUser, 'blocked')

  } else {
    await database.changeStatus(idUser, 'active')
  }
  const updateUsers = await database.getUsers();
  res.json({updateUsers});
})

app.post('/userPage', async (req, res) => {
  const id = req.body.id;
  const collections = await database.getMyCollections(id);
  const dataUser = await database.getUserById(id);
  res.json({collections, dataUser})
  res.end()
})
app.listen(PORT, () => {
  console.log(`SERVER IS LISTENING ON PORT: ${PORT}`)
})
