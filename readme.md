Simple implementation of Two-Factor-Authentication for
Google Authenticator App or other similars

2FA == TFA

<h1> Steps: </h1>

- User registers and logs in
 
- Server sends JWT Token indicating if user needs 2FA
 
- User requests new secret for 2FA
 
- User confirmates secret by sending One-Time Password that appears on Google Authenticator or other app

- Each time user logs in, server returns token to be sent to verification route in order to completes authentication


<h1> TODOS: </h1>

- Better error outputs
 
- Limit ips that request too often
 
- Implement tests
 
- Implements logs for authentication
 
- Implements integration with some Key Vault Manager

- Implements account blocking
