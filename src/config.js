import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

var firebaseConfig = {
    apiKey: "AIzaSyDQgnANhLtQM0ah2ZDLM4whfMH1E4OIZfo",
    authDomain: "course-swap.firebaseapp.com",
    projectId: "course-swap",
    databaseURL: "https://course-swap.firebaseio.com",
    storageBucket: "course-swap.appspot.com",
    messagingSenderId: "552157950168",
    appId: "1:552157950168:web:a21dbacaa88e43e371e7ad",
    measurementId: "G-633069N77L"
};

firebase.initializeApp(firebaseConfig)
export const firestore = firebase.firestore()
export const auth = firebase.auth()

const provider = new firebase.auth.GoogleAuthProvider()
provider.setCustomParameters({ prompt: "select_account" })

export const googleAuth = () => auth.signInWithPopup(provider)

export const googleSave = user => {
    const { displayName, email, photoURL } = user
    const ref = firestore.collection("users").doc(`${user.uid}`)
    if (ref.exists)
        ref.set({
            displayName: displayName,
            email: email,
            photoURL: photoURL,
            coursesHaveList: [],
            coursesWantList: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid: user.uid
        })
}

export const addCourseTo = (details) => {
    const { name, code, time } = details
    console.log(details);
    firestore.collection("courses").doc(`${code}`).set({
        courseName: name,
        courseCode: code,
        courseTimings: time,
        seatsAvailable: 0,
        seatsInDemand: 0,
        studentsHaveList: [],
        studentsWantList: []
    })
}

export const addRequirementTo = (requestData, user) => {
    const { courseHave, courseWant } = requestData
    const { displayName } = user
    if (courseWant === "ANY") {
        firestore.collection("courses").get().then(Snapshot => {
            Snapshot.forEach(doc => {
                doc.data().studentsHaveList.push(displayName)
                doc.data().seatsInDemand = doc.data().seatsInDemand + 1
                firestore.collectionGroup("users").doc(`${user.uid}`).update({
                    coursesHaveList: firebase.firestore.FieldValue.arrayUnion(doc.data().courseCode)
                })
            })
        })
    }
    if (courseHave !== "NONE" && courseWant !== "ANY") {
        firestore.collection("courses").doc(`${courseHave}`).update({
            studentsHaveList: firebase.firestore.FieldValue.arrayUnion(displayName),
            seatsAvailable: firebase.firestore.FieldValue.increment(1)
        })
        firestore.collection("users").doc(`${user.uid}`).update({
            coursesHaveList: firebase.firestore.FieldValue.arrayUnion(courseHave)
        })
        firestore.collection("courses").doc(`${courseWant}`).update({
            studentsWantList: firebase.firestore.FieldValue.arrayUnion(displayName),
            seatsInDemand: firebase.firestore.FieldValue.increment(1)
        })
        firestore.collection("users").doc(`${user.uid}`).update({
            coursesWantList: firebase.firestore.FieldValue.arrayUnion(courseWant)
        })
    }
}

export const removeCourse = (code, user, type) => {
    if (type === "HAVE") {
        firestore.collection("users").doc(`${user.id}`).update({
            coursesHaveList: firebase.firestore.FieldValue.arrayRemove(code)
        })
        firestore.collection("courses").doc(`${code}`).update({
            studentsHaveList: firebase.firestore.FieldValue.arrayRemove(user.displayName),
            seatsAvailable: firebase.firestore.FieldValue.increment(-1)
        })
    }
    if (type === "WANT") {
        firestore.collection("users").doc(`${user.id}`).update({
            coursesWantList: firebase.firestore.FieldValue.arrayRemove(code)
        })
        firestore.collection("courses").doc(`${code}`).update({
            studentsWantList: firebase.firestore.FieldValue.arrayRemove(user.displayName),
            seatsInDemand: firebase.firestore.FieldValue.increment(-1)
        })
    }
}


export default firebase