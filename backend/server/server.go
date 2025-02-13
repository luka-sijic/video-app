package server

import (
	"net/http"
	"strings"
	"log"
	"os"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
    	"github.com/labstack/echo/v4/middleware"
)

var jwtToken string

func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	jwtToken = os.Getenv("JWT_TOKEN")
}

var jwtSecret = []byte(jwtToken)

type Claims struct {
	Username string `json:"username"`
	Userid string `json:"id"`
	jwt.RegisteredClaims
}

func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing authorization header")
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		// Parse and validate the token
		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
		}

		if claims, ok := token.Claims.(*Claims); ok && token.Valid {
			// Store the claims in the context for later use
			c.Set("username", claims.Username)
			c.Set("id", claims.Userid)
			return next(c)
		}

		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}
}

func Start() {
	e := echo.New()

	// Update CORS upon deployment
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"}, 
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization}, 
    	AllowCredentials: false,
	}))

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())


	// Video Endpoints
	e.POST("/upload", uploadVideo, JWTMiddleware)
	e.GET("/video/:id", getVideo)
	e.GET("/video/:id/metadata", getVideoMetadata)
	// Comment Endpoints
	e.GET("/video/:id/comment", getComments)
	e.POST("/video/:id/comment", sendComment, JWTMiddleware)
	// Like Endpoints
	e.POST("/video/:id/like", likeVideo)
	e.POST("/video/:id/unlike", unlikeVideo)
	e.GET("/video/:id/likes", getLikes)
	// View Endpoints
	e.POST("/video/:id/view", viewVideo)
	e.GET("/video/:id/views", getViews)
	e.GET("/home/:id", getHomePage, JWTMiddleware)
	e.GET("/video/:id/delete", deleteVideo)

	e.Static("/thumbnails", "./uploads/thumbnails")
	e.Static("/avatars", "./uploads/avatars")
	e.Static("/icons", "./uploads/icons")
	e.Static("/streams", "./streams")

	// Profile Endpoints
	e.GET("/profile/:id", getProfile)
	e.GET("/storage/:id", getStorage)
	e.GET("/activity/:id", getActivity)
	// Settings Endpoints
	e.POST("/country", changeCountry, JWTMiddleware)
	e.POST("/uploadpfp", uploadPfp, JWTMiddleware)
	e.POST("/changeusername", changeUsername, JWTMiddleware)
	e.GET("/", root)
	
	e.Logger.Fatal(e.Start(":8086"))
}

func root(c echo.Context) error {
	return c.JSON(http.StatusOK, "api")
}
