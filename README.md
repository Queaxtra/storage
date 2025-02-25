# Storage

A photo storage site made with Appwrite and SvelteKit.

## Installation

### 1. Appwrite setup

1. First, go to the [Appwrite](https://appwrite.io/) site.
2. Create a project.
3. Go to the "Storage" section and create a new "bucket".
![](https://www.upload.ee/image/17787090/SCR-20250225-otqn.png)
![](https://www.upload.ee/image/17787099/SCR-20250225-ouft.png)
4. After the "Bucket" is created, go to the "Permissions" section, enter one "Any" and one your own account name, and activate the "CREATE", "READ", "UPDATE" and "DELETE" sections.
![](https://www.upload.ee/image/17787121/SCR-20250225-owja.png)
*Create your account manually in the "Auth" section and specify it in the "Permissions" section as in the picture.*
5. At the bottom, there is a section called "Allowed file extensions", check all the options in this section.
![](https://www.upload.ee/image/17787125/SCR-20250225-owto.png)
6. Appwrite setup is complete, now let's get the project ready to run on your own computer.

### 2. Project setup

1. Clone the project from Github.

    ```bash
    git clone https://github.com/queaxtra/storage.git
    ```

2. After cloning the project, go to the project directory.

    ```bash
    cd storage
    ```
3. Create a `.env` file and put the following information into it.

    ```bash
    # The value of the "bucket" you created in your Appwrite project.
    VITE_APP_BUCKET_ID=
    # The ID of the project you are working on on Appwrite.
    VITE_APP_PROJECT_ID=
    ```

4. Use the following command to run the project.

    ```bash
    npm run dev
    ```

## Usage

1. After running the project, you can go to `http://localhost:5173`. Here you will be prompted to log in to your account, you need to enter the information of the account you created on Appwrite.

2. If you have successfully logged into your account, you can upload your photos from the `/dashboard` section.

## Features

- Upload photos
- Delete photos
- Download photos
- View photos.

## Contributing

This project is open source. If you would like to contribute, please create a "Pull Request".

## License

The project is licensed under the MIT license.