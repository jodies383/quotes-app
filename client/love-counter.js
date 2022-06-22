import axios from "axios";

export function LoveCounter() {
  const URL_BASE = import.meta.env.VITE_SERVER_URL;
  return {
    username: '',
    password: '',
    heartsCount: '',
    loginUsername: '',
    loginPassword: '',
    loginInput: true,
    logoutBtn: false,
    registerInput: true,
    mainContent: false,
    errorMessage: false,
    successMessage: false,

    init() {
      if (localStorage.getItem('token') && localStorage.getItem('username')) {
        this.registerInput = false
        this.loginInput = false
        this.mainContent = true
        this.logoutBtn = true
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        const username = localStorage.getItem('username')
        axios
          .get(`${URL_BASE}/api/hearts/${username}`, { withCredentials: true, })
          .then((result) => {
            this.heartsCount = result.data.data
          });
        setInterval(() => {
          axios
            .post(`${URL_BASE}/api/hearts/decrease`, { username: username })
            .then((result) => {
              this.heartsCount = result.data.data
            });
        }, 10000)

      }
    },
    logout() {
      localStorage.clear()
      this.logoutBtn = false
      this.registerInput = true
      this.loginInput = true
      this.mainContent = false
      this.loginUsername = ''
      this.loginPassword = ''
    },

    register() {
      if (this.username !== '') {
        axios
          .post(`${URL_BASE}/api/register`, { username: this.username, password: this.password })
          .then((result) => {
            if (result.data.message == 'success') {
              this.successMessage = true,
                this.$refs.successMessage.innerText = 'registration successful'

              this.successMessage = true,
                this.$refs.successMessage.innerText = 'registration successful'
            } else {
              this.errorMessage = true,
                this.$refs.errorMessage.innerText = 'this username has already been registered'
            }


          });

      }
      setTimeout(() => { this.errorMessage = false }, 2000);
      setTimeout(() => { this.successMessage = false }, 2000);

      this.username = ''
      this.password = ''
    },
    login() {
      this.user = localStorage.getItem('username')
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      axios
        .post(`${URL_BASE}/api/login`, { username: this.loginUsername, password: this.loginPassword })
        .then((result) => {
          if (result.data.message == 'unregistered') {
            this.errorMessage = true,
              this.$refs.errorMessage.innerText = 'this username has not been registered'
            this.loginUsername = ''
            this.loginPassword = ''
          } else if (result.data.message == 'unmatched') {
            this.errorMessage = true,
              this.$refs.errorMessage.innerText = 'incorrect username or password'
            this.loginUsername = ''
            this.loginPassword = ''
          } else {
            localStorage.setItem('username', this.loginUsername);
            const { token } = result.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

            const results = result.data
            if (results.message == 'success') {
              this.mainContent = true
              this.registerInput = false
              this.loginInput = false
              this.logoutBtn = true

              axios
                .get(`${URL_BASE}/api/hearts/${this.loginUsername}`)
                .then((result) => {
                  this.heartsCount = result.data.data
                });
              this.successMessage = true,
                this.$refs.successMessage.innerText = 'login successful'
            }
          }

        });
      setTimeout(() => { this.errorMessage = false }, 2000);
      setTimeout(() => { this.successMessage = false }, 2000);
    }
    ,
    increaseHearts() {
      const username = localStorage.getItem('username')
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      axios
        .post(`${URL_BASE}/api/hearts`, { username: username })
        .then((result) => {
          this.heartsCount = result.data.data
          this.loading = false
        }).catch(() => this.loading = false)
    },
    displayHearts() {
      const username = localStorage.getItem('username')
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      axios
        .get(`${URL_BASE}/api/hearts/${username}`)
        .then((result) => {
          if (result.data.message == 'expired') {
            if (localStorage.getItem('token')) {
              this.logout
              this.errorMessage = true,
                this.$refs.errorMessage.innerText = 'session expired'
            }
          }
          else {
            this.heartsCount = result.data.data
          }
        });
      setTimeout(() => { this.errorMessage = false }, 2000);
    }
  }
}