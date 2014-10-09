UI = ember
BIN = ./node_modules/.bin

build:
	@cd $(UI) && \
		$(BIN)/ember build --environment production

clean:
	@cd $(UI) && \
		rm -rf dist tmp

test:
	@cd $(UI) && \
		$(BIN)/ember test


serve-ui:
	@cd $(UI) && \
		@$(BIN)/ember serve

serve-api:
	@$(BIN)/sails lift


install:
	@npm install && \
		cd $(UI) && \
		npm install && \
		$(BIN)/bower install


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
