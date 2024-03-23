import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

export const getItems = async (id) => {
  const [items] = await pool.query(`
  SELECT * FROM items
  WHERE idCollection = ?`,
  [id]);
  return items;
}

export const getCollections = async () => {
  const [collections] = await pool.query("SELECT * FROM collections");
  return collections;
}

export const getCollection = async (id) => {
  const [collections] = await pool.query(`
  SELECT * FROM collections
  WHERE id = ?`,
  [id]);
  return collections;
}

export const getMyCollections = async (idUser) => {
    const [collection] = await pool.query(`
    SELECT * 
    FROM collections 
    WHERE createdBy = ?
  `, [idUser])
  return collection;
}

export const getItem = async (id) => {
  const [item] = await pool.query(`
  SELECT * 
  FROM items 
  WHERE id = ?
  `, [id])
  return item[0];
}

export const createCollection = async (name, descr, topic, createdBy, field1, field2, field3, linkToImage) => {
  const [newCollection] = await pool.query(`
    INSERT INTO collections (name, description, topic, createdBy, field1, field2, field3, linkToImage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, descr, topic, createdBy, field1, field2, field3, linkToImage]);
    return newCollection.insertId;
  }

export const addItem = async (name, tag, id, field1 = null, field2 = null, field3 = null, login) => {
  const [newItem] = await pool.query(`
    INSERT INTO items (name, tag, idCollection, field1, field2, field3, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, tag, id, field1, field2, field3, login]);
  return newItem.insertId;
}

export const deleteItem = async (id) => {
  await pool.query(`
  DELETE FROM items
  WHERE id = ?`,
  [id])
  return;
}

export const deleteItems = async (idColl) => {
  await pool.query(`
  DELETE FROM items
  WHERE idCollection = ?`,
  [idColl])
  return;
}

export const deleteCollection = async (id) => {
  await pool.query(`
  DELETE FROM collections
  WHERE id = ?`,
  [id])
  return;
}

export const deleteCollections = async (createdBy) => {
  await pool.query(`
    DELETE FROM collections
    WHERE createdBy IN (?)`, 
    [createdBy]);
  return;
}

export const getUsers = async () => {
  const [users] = await pool.query(`SELECT * FROM users`)
  return users;
}

export const isAlreadyExistUser = async (login) => {
  const [result] = await pool.query(
   `SELECT * FROM users
    WHERE login = ?`,
    [login])
    return result.length > 0 ? true : false
}

export const isCorrectDataUser = async (login, password) => {
 const [result] = await pool.query(
  `SELECT * FROM users
  WHERE login = ?
  AND password = ?`,
  [login, password])
  return result.length === 0 ? false : true
}

export const getUser = async (login, password) => {
  const user = await pool.query(`
  SELECT * FROM users 
  WHERE login = ?
  AND password = ?`,
  [login, password])
  return user[0];
}

export const getUserById = async (id) => {
  const user = await pool.query(`
  SELECT * FROM users 
  WHERE id = ?`,
  [id])
  return user[0];
}

export const isAdmin = async (login, password) => {
  const [result] = await pool.query(
    `SELECT * FROM users
    WHERE login = ?
    AND password = ?
    AND admin = true`,
    [login, password])
  return result.length > 0 ? true : false
}

export const createUser = async (login, password, admin, name, status) => {
  const [newUser] = await pool.query(
    `INSERT INTO users (login, password, admin, name, status)
    VALUES (?, ?, ?, ?, ?)`,
    [login, password, admin, name, status])
   return newUser;
}

export const deleteUser = async (user) => {
  await pool.query(`
    DELETE FROM users
    WHERE id = ?`, 
    [user]);
  return;
}

export const makeAdminMakeUser = async (status, usersId) => {
  await pool.execute(`
  UPDATE users SET admin = ?
  WHERE id = ?`, 
  [status, usersId]);
}

export const makeLike = async (idUser, idColl) => {
  await pool.execute(`
  INSERT INTO likes (idUser, idCollection)
  VALUES (?, ?)`,
  [idUser, idColl])
}

export const deleteLike = async (id) => {
  await pool.execute(`
  DELETE FROM likes
  WHERE id = ?`,
  [id])
}

export const getLikes = async () => {
  const [likes] = await pool.query(`
  SELECT * FROM likes`)
  return likes
}

export const addLike = async (idColl) => {
  await pool.execute(`
  UPDATE collections SET likes = likes + 1
  WHERE id = ?`,
  [idColl]);
}

export const deleteLikeColl = async (idColl) => {
  await pool.execute(`
  UPDATE collections SET likes = likes - 1
  WHERE id = ?`,
  [idColl]);
}

export const getLike = async (idUser, idColl) => {
  const [like] = await pool.execute(`
  SELECT * FROM likes
  WHERE idUser = ?
  && idCollection = ?`,
  [idUser, idColl])
  return like;
}


export const changeStatus = async (idUser, newStatus) => {
  await pool.execute(`
  UPDATE users SET status = ?
  WHERE id = ?`,
  [newStatus, idUser]);
}

export const isBlock = async (idUser, status) => {
    const [data] = await pool.query(
      `SELECT * 
      FROM users
      WHERE id = ? 
      && status = ?`
      , [idUser, status])
      return data;
}

export const lastFiveItems = async () => {
  const [items] = await pool.query(`
  SELECT * FROM items
  ORDER BY date DESC
  LIMIT 5`)
  return items;
}

export const countItem = async (idColl) => {
  await pool.execute(`
  UPDATE collections SET countItems = countItems + 1
  WHERE id = ?`,
  [idColl]);
}

export const deleteItemCount = async (idColl) => {
  await pool.execute(`
  UPDATE collections SET countItems = countItems - 1
  WHERE id = ?`,
  [idColl]);
}

export const getLargestCollections = async () => {
  const [coll] = await pool.query(`
  SELECT * FROM collections
  ORDER BY countItems DESC
  LIMIT 5`)
  return coll;
}