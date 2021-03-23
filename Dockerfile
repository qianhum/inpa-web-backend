FROM node:latest AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn workspaces focus --production -A
RUN yarn add -D typescript
COPY src src
COPY tsconfig.json .
RUN yarn build
RUN yarn remove typescript

FROM node:slim
WORKDIR /app
COPY --from=build /app/dist dist
COPY --from=build /app/.yarn .yarn
COPY --from=build /app/.pnp.js .
COPY package.json yarn.lock .yarnrc.yml ./
EXPOSE 20000 
CMD yarn start