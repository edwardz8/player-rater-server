require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db/index')

const morgan = require('morgan')
const app = express()

app.use(cors())
app.use(express.json())

// get all players
app.get("/api/v1/players", async (req, res) => {
    try {
        const results = await db.query('select * from players')
        console.log(results)
        res.status(200).json({
        status: "success",
        results: results.rows.length,
        data: {
            players: results.rows,
        }
    })
    } catch (err) {
        console.log(err)
    }
})

// get a single player and their reviews
app.get("/api/v1/players/:id", async (req, res) => {
    // console.log(req.params.id)
    try {
        const player = await db.query(
            'select * from players where id = $1', [req.params.id]
        )

        const reviews = await db.query(
            'select * from reviews where player_id = $1', [req.params.id]
        )

        res.status(200).json({
            status: "success",
            data: {
                player: player.rows[0],
                reviews: reviews.rows
            }
        })

        // console.log(results.rows[0])
    } catch (err) { console.log(err) }
})

// create a player
app.post("/api/v1/players", async (req, res) => {
    // console.log(req.body)
    try {
        const results = await db.query('INSERT INTO players (name, team, price_range, country) values ($1, $2, $3, $4)', 
        [req.body.name, req.body.team, req.body.price_range, req.body.country] )

        res.status(201).json({
            status: "success",
            data: {
                player: results.rows[0]
            }
        })
    } catch (err) { console.log(err) }

})

// update players
app.put("/api/v1/players/:id", async (req, res) => {
    // console.log(req.params.id)
    // console.log(req.body)
    try {
        const results = await db.query('UPDATE players SET name = $1, team = $2, price_range = $3, country = $4 where id = $5 returning *', 
            [req.body.name, req.body.team, req.body.price_range, req.params.country, req.params.id]
        )

        res.status(200).json({
            status: "success",
            data: {
                player: results.rows[0]
            }
        })
    } catch (err) { console.log(err) }
})

// delete player entry
app.delete("/api/v1/players/:id", async (req, res) => {
    try {
        const results = await db.query('DELETE FROM players where id = $1', [
            req.params.id
        ])
            res.status(204).json({
                status: "success"
            })
    } catch (err) { console.log(err) }
})

// add review
app.post("/api/v1/players/:id/addReview", async (req, res) => {
    try {
       const newReview = await db.query(
           "INSERT INTO reviews (player_id, name, review, rating) values ($1, $2, $3, $4) returning *;", [
            req.params.id, req.body.name, req.body.review, req.body.rating
        ])
        res.status(201).json({
            status: 'success',
            data: {
                review: newReview.rows[0]
            }
        })
    } catch (err) { console.log(err) }
})

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`server is up and running on port ${port}`)
})