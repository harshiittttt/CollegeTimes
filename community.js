// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCov_sFDsJ1qNBqi7kV5qjW9XBvx0aqeNE",
  authDomain: "collegetimes-95055.firebaseapp.com",
  projectId: "collegetimes-95055",
  storageBucket: "collegetimes-95055.firebasestorage.app",
  messagingSenderId: "80924201871",
  appId: "1:80924201871:web:4db081cbba6f6035e971fa",
  measurementId: "G-HD0QLJHLTQ"
};

// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const postTitle = document.getElementById("postTitle");
const postContent = document.getElementById("postContent");
const postButton = document.getElementById("postButton");
const postsContainer = document.getElementById("postsContainer");

// Handle Post Creation
postButton.addEventListener("click", async () => {
  const title = postTitle.value.trim();
  const content = postContent.value.trim();

  if (title === "" || content === "") {
    alert("Please fill both fields before posting!");
    return;
  }

  try {
    await addDoc(collection(db, "communityPosts"), {
      title,
      content,
      timestamp: serverTimestamp()
    });
    postTitle.value = "";
    postContent.value = "";
  } catch (err) {
    console.error("Error adding post:", err);
  }
});

// Listen to Posts
const postsQuery = query(collection(db, "communityPosts"), orderBy("timestamp", "desc"));
onSnapshot(postsQuery, (snapshot) => {
  postsContainer.innerHTML = "";
  snapshot.forEach((postDoc) => {
    const post = postDoc.data();
    const postId = postDoc.id;

    const postDiv = document.createElement("div");
    postDiv.classList.add("card", "p-6", "rounded-2xl", "shadow-md", "bg-white", "mb-6");

    postDiv.innerHTML = `
      <h4 class="text-xl font-semibold text-pink-500 mb-2">${post.title}</h4>
      <p class="text-gray-700 mb-2">${post.content}</p>
      <p class="text-sm text-gray-400 mb-3">🕒 ${
        post.timestamp?.toDate ? post.timestamp.toDate().toLocaleString() : "Just now"
      }</p>

      <button class="btn bg-pink-500 text-white px-3 py-1 rounded-md comment-toggle mb-2">💬 Comment</button>
      <div class="comment-section hidden mt-2">
        <textarea class="comment-input w-full p-2 border rounded-md mb-2" rows="2" placeholder="Write a comment..."></textarea>
        <button class="btn post-comment bg-gray-800 text-white px-3 py-1 rounded-md">Post Comment</button>
      </div>
      <div class="comments-list mt-3 pl-3 border-l-2 border-gray-200"></div>
    `;

    const toggleCommentBtn = postDiv.querySelector(".comment-toggle");
    const commentSection = postDiv.querySelector(".comment-section");
    const postCommentBtn = postDiv.querySelector(".post-comment");
    const commentInput = postDiv.querySelector(".comment-input");
    const commentsList = postDiv.querySelector(".comments-list");

    // Toggle Comment Box
    toggleCommentBtn.addEventListener("click", () => {
      commentSection.classList.toggle("hidden");
    });

    // Add a Comment
    postCommentBtn.addEventListener("click", async () => {
      const text = commentInput.value.trim();
      if (text === "") return;

      await addDoc(collection(db, "communityPosts", postId, "comments"), {
        text,
        timestamp: serverTimestamp()
      });

      commentInput.value = "";
    });

    // Display Comments and Replies
    const commentQuery = query(
      collection(db, "communityPosts", postId, "comments"),
      orderBy("timestamp", "asc")
    );

    onSnapshot(commentQuery, (commentSnap) => {
      commentsList.innerHTML = "";

      commentSnap.forEach((commentDoc) => {
        const comment = commentDoc.data();
        const commentId = commentDoc.id;

        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment", "text-gray-700", "text-sm", "mb-3", "bg-gray-50", "p-2", "rounded-md");

        commentDiv.innerHTML = `
          <p>💬 ${comment.text}</p>
          <button class="reply-btn text-blue-500 text-xs mt-1">↩️ Reply</button>
          <div class="reply-section hidden mt-2">
            <textarea class="reply-input w-full p-2 border rounded-md mb-2" rows="2" placeholder="Write a reply..."></textarea>
            <button class="btn post-reply bg-gray-800 text-white px-3 py-1 rounded-md text-xs">Post Reply</button>
          </div>
          <div class="replies-list pl-3 mt-2 border-l-2 border-gray-100"></div>
        `;

        const replyBtn = commentDiv.querySelector(".reply-btn");
        const replySection = commentDiv.querySelector(".reply-section");
        const replyInput = commentDiv.querySelector(".reply-input");
        const postReplyBtn = commentDiv.querySelector(".post-reply");
        const repliesList = commentDiv.querySelector(".replies-list");

        // Toggle reply box
        replyBtn.addEventListener("click", () => {
          replySection.classList.toggle("hidden");
        });

        // Add Reply
        postReplyBtn.addEventListener("click", async () => {
          const replyText = replyInput.value.trim();
          if (replyText === "") return;

          await addDoc(collection(db, "communityPosts", postId, "comments", commentId, "replies"), {
            text: replyText,
            timestamp: serverTimestamp()
          });

          replyInput.value = "";
        });

        // Listen to Replies
        const replyQuery = query(
          collection(db, "communityPosts", postId, "comments", commentId, "replies"),
          orderBy("timestamp", "asc")
        );

        onSnapshot(replyQuery, (replySnap) => {
          repliesList.innerHTML = "";
          replySnap.forEach((replyDoc) => {
            const reply = replyDoc.data();
            const replyDiv = document.createElement("div");
            replyDiv.classList.add("text-gray-600", "text-xs", "bg-gray-100", "p-2", "rounded-md", "mb-1");
            replyDiv.textContent = `↪️ ${reply.text}`;
            repliesList.appendChild(replyDiv);
          });
        });

        commentsList.appendChild(commentDiv);
      });
    });

    postsContainer.appendChild(postDiv);
  });
});
