UI = ember
BIN = ./node_modules/.bin
SAILS = ./node_modules/sails/bin/sails.js
ifndef ENV
ENV = development
endif
NODE_ENV = ENV
ifeq ($(ENV),development)
VERBOSE = --verbose
PROD =
else
VERBOSE =
PROD = --prod
endif

define ember
	cd $(UI) && $(BIN)/ember $(1) && cd ..
endef

define sails
	$(SAILS) $(1)
endef


build:
	$(call ember,build --environment $(ENV))


clean:
	@cd $(UI) && \
		rm -rf dist tmp


tests:
	@$(call ember,test --environment $(ENV)) && \
		$(BIN)/grunt test


#TODO: improve this so that it uses forever or such
serve: build serve-api


serve-ui:
	@$(call ember,serve --environment $(ENV))

serve-api:
	@$(call sails,lift $(PROD) $(VERBOSE))


install:
	@npm install && \
		cd $(UI) && \
		npm install && \
		$(BIN)/bower install


ember-cli:
	@$(call ember,$(CMD))


sails-cli:
	@$(call sails,$(CMD))


define release
	VERSION=`node -pe "require('./package.json').version"` && \
	NEXT_VERSION=`node -pe "require('semver').inc(\"$$VERSION\", '$(1)')"` && \
	node -e "\
		var j = require('./package.json');\
		j.version = \"$$NEXT_VERSION\";\
		var s = JSON.stringify(j, null, 2);\
		require('fs').writeFileSync('./package.json', s);\
		var u = require(\"$$UI\/package.json");
		u.version = j.version;\
		s = JSON.stringify(j, null, 2);\
		require('fs').writeFileSync(\"$$UI\/package.json", s);" && \
	git commit -m "release $$NEXT_VERSION" -- package.json $$UI/package.json && \
	git tag "$$NEXT_VERSION" -m "release $$NEXT_VERSION"
endef


release-patch: test build
	@$(call release,patch)


release-minor: test build
	@$(call release,minor)


release-major: test build
	@$(call release,major)


publish: test build
	@git push --tags origin HEAD:master
