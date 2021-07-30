# Guidlines to Setup Fabric Connection

## Create connection file

* Navigate to `/organizations/peerOrganizations/<folder of the organization the server should connect to>`
* Create a file and name it `connection-<orgName>.json`

## Add configuration to the created file

* Copy the following code in the created file and modify it where comments are. Delete the comments along the progress.
```
{
    "name": "test-network-org1", // The name of the connection (can be anything)
    "version": "1.0.0",
    "client": {
        "organization": "Org1", // The organization name which the server should be connected to (case sensitive)
        "connection": {
            "timeout": {
                "peer": {
                    "endorser": "300"
                }
            }
        }
    },
    "organizations": {
        "Org1": { // The organization name which the server should be connected to (case sensitive)
            "mspid": "Org1MSP", // The organization MSP which the server should be connected to (case sensitive)
            "peers": [
                "peer0.org1.example.com" // The peer's name which the server should interact with (this peer should hold the chaincode)
            ],
            "certificateAuthorities": [
                "ca.org1.example.com" // The relevant CA address of the pre-defined organization
            ]
        }
    },
    "peers": {
        "peer0.org1.example.com": { // The peer's name which the server should interact with (this peer should hold the chaincode)
            "url": "grpcs://localhost:7051", // The peer's URL configured in Fabric network (peers run locally using Docker should be the same or different port) 
            "tlsCACerts": {
                "pem": "-----BEGIN CERTIFICATE-----\nMIICWDCCAf2gAwIBAgIQbTLQfA/6sN35X+LlATl7CTAKBggqhkjOPQQDAjB2MQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEfMB0GA1UEAxMWdGxz\nY2Eub3JnMS5leGFtcGxlLmNvbTAeFw0yMDA4MTgwMjQ1MDBaFw0zMDA4MTYwMjQ1\nMDBaMHYxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH\nEw1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBvcmcxLmV4YW1wbGUuY29tMR8wHQYD\nVQQDExZ0bHNjYS5vcmcxLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0D\nAQcDQgAERDJYn6ariwIbffROZHeUBWYgNEAZzOP5Di/DzImEZ3/0Fpq/6MnRSten\nPc+Ob5aK6E2ai4SW62Fw1A6S7D/72qNtMGswDgYDVR0PAQH/BAQDAgGmMB0GA1Ud\nJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1Ud\nDgQiBCBu6K4bRD6FES4cMJcDBp2mrAzzQh6Uk9tj6on/MQSDDzAKBggqhkjOPQQD\nAgNJADBGAiEA1q8JfxEc78QvVrn2o9mjTaq6bgL88NhHaCf+C3GlLVYCIQDDDVth\nZ6H9PAk5Z/abQrggQCw/YvDqo/FO/jgZsvPp1A==\n-----END CERTIFICATE-----" // Copy the actual content of the tlsca cert of the peer and put here
            },
            "grpcOptions": {
                "ssl-target-name-override": "peer0.org1.example.com", // The peer's name which the server should interact with
                "hostnameOverride": "peer0.org1.example.com" // The peer's name which the server should interact with
            }
        }
    },
    "certificateAuthorities": {
        "ca.org1.example.com": { // The ca's name which the server should interact with
            "url": "https://localhost:7054", // The ca's URL configured in Fabric network (run locally using Docker should be the same or different port)
            "caName": "ca.org1.example.com", // The ca's name which the server should interact with
            "tlsCACerts": {
                "pem": "-----BEGIN CERTIFICATE-----\nMIICUTCCAfigAwIBAgIRAOJLGMxZNxdscXgpfOEuG94wCgYIKoZIzj0EAwIwczEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwODE4MDI0NTAwWhcNMzAwODE2MDI0NTAw\nWjBzMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\nU2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UE\nAxMTY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA\nBGcSX1AlbJr/fmgESZbpRyDyUnZXSqCw/aP1n5NsaLKuhXF8SzaKDpQIjCFTXOQN\nEB0ZXZ4yqctxNBYHw3APAUKjbTBrMA4GA1UdDwEB/wQEAwIBpjAdBgNVHSUEFjAU\nBggrBgEFBQcDAgYIKwYBBQUHAwEwDwYDVR0TAQH/BAUwAwEB/zApBgNVHQ4EIgQg\nxdK9PzpsvbWEY6ci41on6slEYvFIgOb2oQ/xq8JC6Q8wCgYIKoZIzj0EAwIDRwAw\nRAIgBLCXghYz/uuTeor1TxxNObq0yudo3QEBjkqrYqY0MI8CIH/NxNMJk+bELx1i\nkKCeVokD1RViDtr3PMISkNeEbFB7\n-----END CERTIFICATE-----" // Copy the actual content of the tlsca cert of the CA and put here
            },
            "httpOptions": {
                "verify": false
            }
        }
    }
}
```

* Save the file. We are going to use it in the Fabric Manager.