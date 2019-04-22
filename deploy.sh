#!/usr/bin/env bash

aws elasticbeanstalk create-environment --application-name mern --environment-name Mern-database-env --version-label v1 --template-name default --option-settings file://env.json