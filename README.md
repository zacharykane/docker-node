# Use Docker to create a simple Node server!

We'll need to:

Mount a local folder to the container filesystem: Using this mount point as your container working directory, you'll persist locally any files created within the container and you'll make the container aware of any local changes made to project files.

Allow the host to interact with the container network: By mapping a local port to a container port, any HTTP requests made to the local port will be redirected by Docker to the container port.

We can use a few components of Docker to achieve these!

## Dockerfile

this defines our base image (os our server is based on and the environment it sets up with) along with our starting command (or entrypoint).

## docker-compose.yml

Docker Compose allows us to compose multiple containers together. We can also take advantage of it for one server, where we define our host (actual local machine) port to our container port. Also crucially we'll define which host file directories will be mapped onto the container.

## Development Methods

We can do it all with one long docker run command, but it can be hard to follow and just a pain to remember/type out.

```bash
$ docker run --rm -it --name node-docker \
-v $PWD:/home/app -w /home/app \
-e "PORT=3000" -p 8080:3000  \
-u node node:latest /bin/bash
```

So, let's use our Dockerfile to take responsibility for some of these features and options:

-   `FROM` specifies the container base image: `node:latest`
-   `WORKDIR` defines `-w`
-   `USER` defines `-u`
-   `ENV` defines `-e`
-   `ENTRYPOINT` specifies to execute `/bin/bash` once the container runs

However, container runtime flags that define container name, port mapping, and volume mounting still need to be specified with `docker run`, hmm. We'll also have to build our image first using `docker build`.

> We name our image (the blueprint of a container) with a "tag".

`$ docker build -t node-docker ./`

Now, we can use a slightly shorter `docker run` command:

```bash
$ docker run --rm -it --name node-docker \
-v $PWD:/home/app -p 8080:3000 \
node-docker
```

> We can also name our container (so it's easy to find in running processes) with a "name".

However we can still do better. We can define our name, port and disk mappings with a docker compose configuration.

```yml
version: '3'
services:
    nod_dev_env:
        build: .
        container_name: node-docker
        ports:
            - 8080:3000
        volumes:
            - ./:/home/app
```

-   `nod_dev_env` gives the service a name to easily identify it
-   `build` specifies the path to the Dockerfile
-   `container_name` provides a friendly name to the container
-   `ports` configures host-to-container port mapping
-   `volumes` defines the mounting point of a local folder into a container folder

Now we can simply run:

`$ docker-compose up`

up builds its own images and containers _separate_ from those created by the docker run and docker build commands used before. To verify this run:

```bash
$ docker image
# Notice the image named <project-folder>_nod_dev_env
$ docker ps -a
# Notice the container named <project-folder>_nod_dev_env_<number>
```

So `docker-compose up` starts a _"full service composition"_. It, by default, will only present container logs to the terminal it's executed in. We of course want more interactive input with our "service", so now:

`$ docker-compose run --rm --service-ports nod_dev_env`

This command acts like `docker run -it`. The `--service-ports` flag tells docker compose to use the port mappings in the docker-compose.yml.

The idea now is that with this Docker setup, we have an interactive terminal into a system where Node is working, npm is available, our processes can run safely and our environment can be setup however we need. We don't have to maintain this open shell though. We can instead use `docker-compose up` to bring our server up and view any logs we write, and use `docker exec` along with the container ID to run commands _against_ our server that the system inside will understand (npm installs, node script execution, etcetera).

> You don't use `docker run` as that command would create a new isolated container.

The container ID can be obtained in a couple ways. If you have an active shell, the ID is part of the prompt:

`node@<CONTAINER ID>:/home/app$`

Or, we can use docker to find the ID of our container by its container name:

`$ docker ps -qf "name=node-docker"`

Once we have that, we can use exec to execute commands within our container:

```bash
# Open a new instance of the running container shell
$ docker exec -it $(docker ps -qf "name=node-docker") /bin/bash
# Install or remove dependencies
$ docker exec -it $(docker ps -qf "name=node-docker") yarn add body-parser
```

## Credit

The above was paraphrased and edited for my use from the great guide https://auth0.com/blog/use-docker-to-create-a-node-development-environment/ by Dan Arias! Thank you for all of this great info!
