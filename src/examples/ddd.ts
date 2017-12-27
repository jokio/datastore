import { AggregateRootResolver, Datastore } from "../index";
import { AccountAggregate, CustomerAggregate } from "./domain";

const credentials = { "type": "service_account", "project_id": "jok-joker", "private_key_id": "0160dacd6be040366407db7fa8e8946eca488a2f", "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtMnxBc9GzJgT1\n8aIAj0XFk7eJvW8FeSdcJrb9MQsYV9pIxoOYb99nCghwjbM/svm8hFdl70wkldlH\nRu9L5NjXnQ38vqJvm3evsbj1DBl6NYgAJtmK3Q+B88LNVVLNogDZ6oEhqnQGFwcq\njTi+MXXW/+UxpJdCuh0lgmoR85MiBkwug69YRrwg7jEfiGkchadHQWJX/gihM3/A\nS3c9qHjhOKgQZm/QaQslmkGEpiqM4lrBddF100ZTEZ51DFYeIJSzikOOBd8vy4y4\nPW7l92JBLFOIVh27mHkIFnDKPhymKX/618Fqz62tP0WRKuF/nUvfLYUHIlIIa1+4\nh2lGJeLbAgMBAAECggEAA6tQ6Nqdg+nGDn6KZ2Rb0xeXuoC1qIxYBp+1WEXsfB0h\ncZeGUP93jwOW/YvN3sGODJxprzmn6ofGtzfmLRnALngZ/oflXsxiJfWWmHoMR/Iy\n1XFDE5LRnYN+vpmC7CkjxzRD8UH2JTMQsTWtKBzlf1dR3R3IT3wU5hWrQmrrAzCH\nfiVawVhtsTcKFRY9nO0bm7bpmE3XfJszs8YzIqAdWKVTBqIxpXVAgVB+jPM3V2MF\nuF/VaYoC3S7iwxnv3btib2w8TZ7AVzSY8Md4+BRFtLaZQIZDWtM93FY31KplVWxk\nxqCZbVwC0kgW7Nipkuk/Tey6/wLOGL6PoHMz3ZkjcQKBgQDzzhc6c90OE3OiDmt2\nbf5UW1Cx+tmzK/+UIOSVih7C1TW1QtyFj6rYIEzg7nlLWvkA9EpftROuancBtwoM\nRXRirRXvlG7xYZ6Ney/Oxq+ISL+p5fROY/rHNMtiJWw2+fbW3G7hbaqDSu3vKfYF\n+XLfPl7y0rEKqet/fe60oKL/qwKBgQC13EP18NMoPTMlxNPeuqpkchnEJSjdWY1o\nLaFMNO3g6xwGyGK/u5ppF3BigfyCdMRyKL1jzh0TuE7bgIn3o4YfdGqKBqdr9x7Q\ngNJmop4w5s9ZC1gI4yBa2U3+Q3UCgwFAPhRiNpeTaXuzAlUbGQbbcc7LlD/tjGPu\nl46urrI5kQKBgQCD+JPkRSFsZCUcnLeY1LNt0DwfC01aSj+/XAq/05MRHb5Dztx1\nw63T7bAPtaacnrLYzGOR6P+tUt32ZLEgsVvtqgmMtQlUyeW8aekYAb60g8ST3/Dd\nmgr+V9qb1uv72lS+O3YdunIpPZ8L7efJlhyTMTzOLjQ9NHtQeMeEqMtynwKBgQCO\nheYY+7hwg63u/pdQqZfaCnXY+4pQFtu0dnY/hAedSoR3aFnDi2IS1FS2Tsq27o36\nLaVnb2PoTXw3mEAH/Hajdhf8vgQ9n7jdjOfXmcBB8NE1JqfCp0V3DXCLQRCVfFfh\nogVVhxU5aOSRwNUz3GQ8XK/FahTDtU+n78zZZ32zkQKBgAd53L+cGqbPQoVbsXNy\ng7l/KC6dlkvL/ulWbJrxMpJsUt1qXArbBwPRDa7eNOWP6taWTFfoxrB6mvWYrGai\ncP0E6ljr2Irs4+jXSRB3Z4zT7HqQlwSryX9sdt71kRWsDXUCkMs5cUg/mM8xaalB\nwxTZqOdH8e8/rOkwh9TpRSmG\n-----END PRIVATE KEY-----\n", "client_email": "jok-joker@appspot.gserviceaccount.com", "client_id": "101163287036168278175", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://accounts.google.com/o/oauth2/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/jok-joker%40appspot.gserviceaccount.com" };
const datastore = new Datastore({ credentials });
const domain = new AggregateRootResolver(datastore);


AccountAggregate.Events.Registered.attach(async x => {
	const customer = domain.get(CustomerAggregate, x.transaction)

	await customer.load(x.data.customerId);
	await customer.updateAccountsCount({ operationType: 'add' });
})

CustomerAggregate.Events.AccountsCountUpdated.attach(async x => {
	console.log("AccountsCountUpdated");
})


async function run() {
	const account = domain.get(AccountAggregate);
	await account.register({ customerId: '1514188041172', currency: 'USD' });
}

run();
