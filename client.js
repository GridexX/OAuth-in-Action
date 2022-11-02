const express = require("express")
const request = require("sync-request")
const url = require("url")
const qs = require("qs")
const querystring = require('querystring')
const cons = require('consolidate')
const __ = require('underscore')
const { randomUUID } = require("crypto")
__.string = require('underscore.string')

const app = express()

app.engine('html', cons.underscore)
app.set('view engine', 'html')
app.set('views', 'files/client')

// authorization server information
const authServer = {
	authorizationEndpoint: 'https://github.com/login/oauth/authorize',
	tokenEndpoint: 'https://github.com/login/oauth/access_token'
}

// client information

const client = {
	"client_id": process.env.GITHUB_CLIENT_ID,
	"client_secret": process.env.GITHUB_CLIENT_SECRET,
	"redirect_uris": ["http://localhost:3000/callback"]
}

const protectedResource = 'https://api.github.com/user'

let state, access_token, scope = null

app.get('/', (req, res) => {
	res.render('index', { access_token: access_token, scope: scope })
})

app.get('/authorize', (req, res) => {
	scope = "user"

	// Send the user to the authorization server
	res.redirect(buildUrl(authServer.authorizationEndpoint, { client_id: client.client_id, redirect_uri: client.redirect_uris[0], state: randomUUID, scope: scope }))

})

app.get('/callback', (req, res) => {

	// Parse the response from the authorization server and get a token

	// retrieve code from the req.query parameters object
	let code = req.query.code

	// Send the code to the token endpoint of the authorization server
	let form_data = qs.stringify({
		grant_type: 'authorization_code', // the type of authorization grant
		code: code,
		redirect_uris: client.redirect_uris[0]
	})

	let headers = {
		'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0',
		'Content-Type': 'application/x-www-form-urlencoded',
		'Accept': 'application/json',
		'Authorization': "Basic " + encodeClientCredentials(client.client_id, client.client_secret) //TODO Basic Auth hints: you can use the encodeClientCredentials methode provided below)		
	}

	let tokRes = request('POST', authServer.tokenEndpoint, {
		headers: headers,
		body: form_data
	})

	// Parse the body of tokRes
	let body = {
		access_token: JSON.parse(tokRes.getBody()).access_token,
		scope: scope,
		token_type: "Bearer"
	}

	access_token = body.access_token
	console.log("ACCESS_TOKEN : " + access_token)
	res.render('index', { access_token: access_token, scope: body.scope })
})

app.get('/fetch_resource', (req, res) => {

	// Use the access token to call the resource server

	if (!access_token) {
		res.render('error', { error: 'Mising access token' })
		return;
	}
	let headers = {
		'Authorization': 'Bearer ' + access_token,
		'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0',
		'Content-Type': 'application/json',
	}

	// Send the request with the bearer authorization
	let resource = request('GET', protectedResource, {
		headers: headers
	})

	if (resource.statusCode >= 200 && resource.statusCode < 300) {
		// Parse the result
		let body = JSON.parse(resource.getBody())
		res.render('data', { resource: body })
		return;
	} else {
		res.render('error', { error: `Server returned response code: ${resource.statusCode}` })
	}
})

const buildUrl = (base, options, hash) => {
	let newUrl = url.parse(base, true)
	delete newUrl.search
	if (!newUrl.query) {
		newUrl.query = {}
	}
	__.each(options, function (value, key, list) {
		newUrl.query[key] = value
	})
	if (hash) {
		newUrl.hash = hash
	}

	return url.format(newUrl)
}

const encodeClientCredentials = (clientId, clientSecret) => {
	const credentialsConcat = querystring.escape(clientId) + ':' + querystring.escape(clientSecret)
	return Buffer.from(credentialsConcat).toString('base64')
}

app.use('/', express.static('files/client'))

const server = app.listen(3000, 'localhost', () => {
	const { address: host, port: port } = server.address()
	console.log(`OAuth Client is listening at http://${host}:${port}`)
})

