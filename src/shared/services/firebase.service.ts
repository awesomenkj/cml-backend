import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase';

@Injectable()
export class FirebaseService {

    public config = {
        apiKey: 'AIzaSyAL8YojUMG1flU4VjoYhgCHGHOukfvjB7I',
        authDomain: 'ck-bot-fc3be.firebaseapp.com',
        databaseURL: 'https://ck-bot-fc3be.firebaseio.com',
        projectId: 'ck-bot-fc3be',
        storageBucket: 'ck-bot-fc3be.appspot.com',
        messagingSenderId: '171901347952'
    };

    public fbInstance;
    public db;
    public constructor() {
        if (!firebase.apps.length) {
            this.fbInstance = firebase.initializeApp(this.config);
        } else {
            this.fbInstance = firebase.app();
        }
        this.db = this.fbInstance.firestore();
        this.db.settings({timestampsInSnapshots: true});
    }
}