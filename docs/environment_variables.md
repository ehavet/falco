# Manage application environment variables

To provide local environment variables for your application, just create a `.env` at the root of the project base on the `.env.example` file. This file must not be commited.
However, at the same time, you can fill the other environment files which need to be commited:
- .env.example.plain with a description of the variable added and an example of the value format required
- .env.development.plain, .env.ci.plain, .env.staging.plain, .env.production.plain for non-secrets variables for respectively, development, ci, staging and production environment.
- .env.development.vault, .env.ci.vault, .env.staging.vault, .env.production.vault for secrets variables for respectively, development, ci, staging and production environment. 

The later are encrypted. To fill it, follow the document below

## Edit crypted env files locally (method 1)
To edit .env.development.vault, .env.ci.vault, .env.staging.vault, .env.production.vault and add/modify/delete a variable, you need to run the following commands
Having ansible install on your local machine, run

`ansible-vault edit .env.development.vault`\
`ansible-vault edit .env.ci.vault`\
`ansible-vault edit .env.staging.vault`\
`ansible-vault edit .env.production.vault`

A password is required, you can find it in `falco-ops` repo inside `group_vars/[environment]-secrets.yml` or ask an OPS.\
**The CI password is the same as the development password.**
- Add/modify/delete the variable and close your editor. 
- The file is kept encrypted.
- You then need to commit the modification.

## Fill crypted env files locally (method 2)
To fill .env.development.vault, .env.ci.vault, .env.staging.vault, .env.production.vault you need to decrypt it.
Having ansible install on your local machine, run

`ansible-vault decrypt .env.development.vault`\
`ansible-vault decrypt .env.ci.vault`\
`ansible-vault decrypt .env.staging.vault`\
`ansible-vault decrypt .env.production.vault`

A password is required, you can find it in `falco-ops` repo inside `group_vars/[environment]-secrets.yml` or ask an OPS.
**The CI password is the same as the development password.**
Now the file is decrypted, do not commit it in this state. You need to reset it with git or encrypt it again if needed

`ansible-vault encrypt .env.development.vault`\
`ansible-vault encrypt .env.ci.vault`\
`ansible-vault encrypt .env.staging.vault`\
`ansible-vault encrypt .env.production.vault`