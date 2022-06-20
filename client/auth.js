import axios from "axios";
export function Authorization() {
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


        onload() {
            if (localStorage.getItem('token') && localStorage.getItem('username')) {
                this.registerInput = false
                this.loginInput = false
                this.mainContent = true
                this.logoutBtn = true
                axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                const username = localStorage.getItem('username')
                axios
                    .get(`http://localhost:4000/api/hearts/${username}`, { withCredentials: true, })
                    .then((result) => {
                        this.heartsCount = result.data.data
                    });
                setInterval(() => {
                    axios
                        .post(`http://localhost:4000/api/hearts/decrease`, { username: username }, { withCredentials: true, })
                        .then((result) => {
                            alert('decreased')
                        });
                }, 3000)

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
                    .post('http://localhost:4000/api/register', { username: this.username, password: this.password }, { withCredentials: true, })
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
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            axios
                .post('http://localhost:4000/api/login', { username: this.loginUsername, password: this.loginPassword }, { withCredentials: true, })
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
                                .get(`http://localhost:4000/api/hearts/${this.loginUsername}`, { withCredentials: true, })
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
                .post('http://localhost:4000/api/hearts', { username: username }, { withCredentials: true, })
                .then((result) => {
                    this.heartsCount = result.data.data
                 });
        },
        displayHearts() {
            const username = localStorage.getItem('username')
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

            axios
                .get(`http://localhost:4000/api/hearts/${username}`, { withCredentials: true, })
                .then((result) => {
                    if (result.data.message == 'expired') {
                        this.errorMessage = true,
                        this.$refs.errorMessage.innerText = 'session expired'
                        localStorage.clear()
                        this.logoutBtn = false
                        this.registerInput = true
                        this.loginInput = true
                        this.mainContent = false
                        this.loginUsername = ''
                        this.loginPassword = ''
                    }
                    else {
                        this.heartsCount = result.data.data
                    }

                });

            setTimeout(() => { this.errorMessage = false }, 2000);
        }
    }
}