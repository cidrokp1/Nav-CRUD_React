
import Header from './Header';
import Nav from './Nav';
import Footer from './Footer';
import Home from './Home';
import NewPost from './NewPost';
import PostPage from './PostPage';
import About from './About';
import Missing from './Missing';
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from './api/posts';
import { format } from 'date-fns';
import EditPost from './EditPost';


function App() {

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  let history = useHistory();


  useEffect(() => {
    const filteredResults = posts.filter(post =>
      ((post.body).toLowerCase()).includes(search.toLowerCase())
      || ((post.title).toLowerCase()).includes(search.toLowerCase()));

    setSearchResults(filteredResults.reverse());
  }, [posts, search]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data);
      } catch (error) {
        if (error.response) {
          //not in the 200 response range
          console.log(error.response.data.message);
          console.log(error.response.data.status);
          console.log(error.response.data.headers);
        } else {
          console.log(`Error: ${error.message}`);
        }

      }
    }
    fetchPosts();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = { id, datetime, title: postTitle, body: postBody };

    try {
      const response = await api.post('/posts', newPost);
      const allPosts = [...posts, response.data];
      setPosts(allPosts);
      setPostTitle("");
      setPostBody("");
      history.push('/');
    } catch (error) {
      console.log(`Error ${error.message}`);
    }

  }

  const handleEdit = async (id) => {
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost = { id, datetime, title: editTitle, body: editBody };
    try {
      const response = await api.put(`/posts/${id}`, updatedPost);

      setPosts(posts.map(post => post.id === id ? { ...response.data } : post));
      setPostTitle("");
      setPostBody("");
      history.push('/');
    } catch (error) {
      console.log(`Error ${error.message}`);
    }

  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      const postList = posts.filter(posts => posts.id !== id);
      setPosts(postList);
      history.push('/');
    } catch (error) {
      console.log(`Error ${error.message}`);
    }

  }

  return (
    <div className="App">
      <Header title={"React JS Blog"} />
      <BrowserRouter>
        <Nav search={search} setSearch={setSearch} />
        <Switch>
          <Route exact path='/'>
            <Home posts={searchResults} />
          </Route>
          <Route exact path='/post'>
            <NewPost
              handleSubmit={handleSubmit}
              postTitle={postTitle}
              setPostTitle={setPostTitle}
              postBody={postBody}
              setPostBody={setPostBody} />
          </Route>

          <Route  path='/edit/:id'>
            <EditPost
              posts={posts}
              handleEdit={handleEdit}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editBody={editBody}
              setEditBody={setEditBody} />
          </Route>

          <Route path='/post/:id'>
            <PostPage posts={posts} handleDelete={handleDelete} />
          </Route>
          <Route path='/about' element={<About />} />
          <Route path='*' component={Missing} />
        </Switch>

      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
